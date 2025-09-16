#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(GameCenterModule, RCTEventEmitter)

// Authentification
RCT_EXTERN_METHOD(authenticate:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

// Access Point & Dashboard
RCT_EXTERN_METHOD(showAccessPoint:(BOOL)visible)
RCT_EXTERN_METHOD(showDashboard)

// Leaderboards & Achievements
RCT_EXTERN_METHOD(submitScore:(NSString *)leaderboardId
                  value:(NSNumber *)value
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(reportAchievement:(NSString *)achievementId
                  percent:(NSNumber *)percent
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

// Matchmaking
RCT_EXTERN_METHOD(findMatch:(NSDictionary *)options
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(disconnect)

// Envoi de données
RCT_EXTERN_METHOD(send:(id)data
                  reliable:(BOOL)reliable
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end
