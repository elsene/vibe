import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SimpleIndex() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🎮 WheelCheckers</Text>
      <Text style={styles.subtext}>Development Build OK!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  subtext: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 10,
  },
});
