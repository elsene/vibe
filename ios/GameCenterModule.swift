import Foundation
import GameKit
import React

@objc(GameCenterModule)
class GameCenterModule: RCTEventEmitter {
    
    private var hasListeners = false
    private var currentMatch: GKMatch?
    private var matchmaker: GKMatchmaker?
    
    override init() {
        super.init()
        print("🎮 GameCenterModule: Initialisé")
    }
    
    // MARK: - RCTEventEmitter
    
    override func supportedEvents() -> [String]! {
        return ["state", "data", "error", "ended"]
    }
    
    override func startObserving() {
        hasListeners = true
        print("🎮 GameCenterModule: Début observation des événements")
    }
    
    override func stopObserving() {
        hasListeners = false
        print("🎮 GameCenterModule: Fin observation des événements")
    }
    
    // MARK: - Authentification
    
    @objc func authenticate(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        print("🎮 GameCenterModule: Tentative d'authentification")
        
        let localPlayer = GKLocalPlayer.local
        
        if localPlayer.isAuthenticated {
            print("🎮 GameCenterModule: Déjà authentifié")
            resolve([
                "authenticated": true,
                "playerId": localPlayer.gamePlayerID,
                "alias": localPlayer.alias
            ])
            return
        }
        
        localPlayer.authenticateHandler = { [weak self] (viewController, error) in
            DispatchQueue.main.async {
                if let error = error {
                    print("🎮 GameCenterModule: Erreur authentification - \(error.localizedDescription)")
                    reject("AUTH_ERROR", error.localizedDescription, error)
                    return
                }
                
                if let viewController = viewController {
                    print("🎮 GameCenterModule: Affichage UI authentification")
                    if let rootViewController = UIApplication.shared.windows.first?.rootViewController {
                        rootViewController.present(viewController, animated: true)
                    }
                } else if localPlayer.isAuthenticated {
                    print("🎮 GameCenterModule: Authentification réussie")
                    resolve([
                        "authenticated": true,
                        "playerId": localPlayer.gamePlayerID,
                        "alias": localPlayer.alias
                    ])
                } else {
                    print("🎮 GameCenterModule: Authentification annulée")
                    reject("AUTH_CANCELLED", "Authentification annulée par l'utilisateur", nil)
                }
            }
        }
    }
    
    // MARK: - Access Point & Dashboard
    
    @objc func showAccessPoint(_ visible: Bool) {
        print("🎮 GameCenterModule: Access Point visible = \(visible)")
        DispatchQueue.main.async {
            if visible {
                GKAccessPoint.shared.isActive = true
                GKAccessPoint.shared.location = .topLeading
            } else {
                GKAccessPoint.shared.isActive = false
            }
        }
    }
    
    @objc func showDashboard() {
        print("🎮 GameCenterModule: Affichage dashboard Game Center")
        DispatchQueue.main.async {
            if let rootViewController = UIApplication.shared.windows.first?.rootViewController {
                let gameCenterViewController = GKGameCenterViewController()
                gameCenterViewController.gameCenterDelegate = self
                rootViewController.present(gameCenterViewController, animated: true)
            }
        }
    }
    
    // MARK: - Leaderboards & Achievements
    
    @objc func submitScore(_ leaderboardId: String, value: NSNumber, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        print("🎮 GameCenterModule: Soumission score - \(leaderboardId): \(value)")
        
        let score = GKScore(leaderboardIdentifier: leaderboardId)
        score.value = value.int64Value
        
        GKScore.report([score]) { error in
            if let error = error {
                print("🎮 GameCenterModule: Erreur soumission score - \(error.localizedDescription)")
                reject("SCORE_ERROR", error.localizedDescription, error)
            } else {
                print("🎮 GameCenterModule: Score soumis avec succès")
                resolve(nil)
            }
        }
    }
    
    @objc func reportAchievement(_ achievementId: String, percent: NSNumber, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        print("🎮 GameCenterModule: Rapport achievement - \(achievementId): \(percent)%")
        
        let achievement = GKAchievement(identifier: achievementId)
        achievement.percentComplete = percent.doubleValue
        
        GKAchievement.report([achievement]) { error in
            if let error = error {
                print("🎮 GameCenterModule: Erreur rapport achievement - \(error.localizedDescription)")
                reject("ACHIEVEMENT_ERROR", error.localizedDescription, error)
            } else {
                print("🎮 GameCenterModule: Achievement rapporté avec succès")
                resolve(nil)
            }
        }
    }
    
    // MARK: - Matchmaking
    
    @objc func findMatch(_ options: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        print("🎮 GameCenterModule: Recherche de match")
        
        let request = GKMatchRequest()
        request.minPlayers = options["minPlayers"] as? Int ?? 2
        request.maxPlayers = options["maxPlayers"] as? Int ?? 2
        request.inviteMessage = options["inviteMessage"] as? String ?? "Voulez-vous jouer à WheelCheckers ?"
        
        matchmaker = GKMatchmaker.shared()
        matchmaker?.findMatch(for: request) { [weak self] (match, error) in
            if let error = error {
                print("🎮 GameCenterModule: Erreur matchmaking - \(error.localizedDescription)")
                reject("MATCH_ERROR", error.localizedDescription, error)
                return
            }
            
            guard let match = match else {
                print("🎮 GameCenterModule: Aucun match trouvé")
                reject("NO_MATCH", "Aucun match trouvé", nil)
                return
            }
            
            print("🎮 GameCenterModule: Match trouvé - \(match.players.count) joueurs")
            self?.currentMatch = match
            match.delegate = self
            
            let isHost = match.players.first?.gamePlayerID == GKLocalPlayer.local.gamePlayerID
            
            resolve([
                "matchId": match.matchID,
                "isHost": isHost
            ])
        }
    }
    
    @objc func disconnect() {
        print("🎮 GameCenterModule: Déconnexion du match")
        currentMatch?.disconnect()
        currentMatch = nil
        matchmaker = nil
    }
    
    // MARK: - Envoi de données
    
    @objc func send(_ data: Any, reliable: Bool, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        guard let match = currentMatch else {
            reject("NO_MATCH", "Aucun match actif", nil)
            return
        }
        
        var dataToSend: Data
        
        if let stringData = data as? String {
            dataToSend = stringData.data(using: .utf8) ?? Data()
        } else if let arrayData = data as? [UInt8] {
            dataToSend = Data(arrayData)
        } else {
            reject("INVALID_DATA", "Format de données invalide", nil)
            return
        }
        
        do {
            try match.send(dataToSend, to: match.players, dataMode: reliable ? .reliable : .unreliable)
            print("🎮 GameCenterModule: Données envoyées (\(dataToSend.count) bytes)")
            resolve(nil)
        } catch {
            print("🎮 GameCenterModule: Erreur envoi données - \(error.localizedDescription)")
            reject("SEND_ERROR", error.localizedDescription, error)
        }
    }
}

// MARK: - GKMatchDelegate

extension GameCenterModule: GKMatchDelegate {
    func match(_ match: GKMatch, didReceive data: Data, fromRemotePlayer player: GKPlayer) {
        print("🎮 GameCenterModule: Données reçues de \(player.alias) (\(data.count) bytes)")
        
        if hasListeners {
            let payload = String(data: data, encoding: .utf8) ?? ""
            sendEvent(withName: "data", body: [
                "from": player.gamePlayerID,
                "payload": payload
            ])
        }
    }
    
    func match(_ match: GKMatch, player: GKPlayer, didChange state: GKPlayerConnectionState) {
        print("🎮 GameCenterModule: État joueur \(player.alias) changé: \(state.rawValue)")
        
        if hasListeners {
            let players = match.players.map { $0.gamePlayerID }
            sendEvent(withName: "state", body: [
                "connected": state == .connected,
                "players": players
            ])
        }
    }
    
    func match(_ match: GKMatch, didFailWithError error: Error?) {
        print("🎮 GameCenterModule: Erreur match - \(error?.localizedDescription ?? "Inconnue")")
        
        if hasListeners {
            sendEvent(withName: "error", body: [
                "code": "MATCH_ERROR",
                "msg": error?.localizedDescription ?? "Erreur inconnue"
            ])
        }
    }
    
    func match(_ match: GKMatch, shouldReinviteDisconnectedPlayer player: GKPlayer) -> Bool {
        print("🎮 GameCenterModule: Demande de réinvitation de \(player.alias)")
        return false // Pas de réinvitation automatique
    }
}

// MARK: - GKGameCenterControllerDelegate

extension GameCenterModule: GKGameCenterControllerDelegate {
    func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
        gameCenterViewController.dismiss(animated: true)
    }
}
