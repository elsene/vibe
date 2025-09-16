import React from 'react';
import { Text, View } from 'react-native';

export default function TestIndex() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'red' }}>
      <Text style={{ color: 'white', fontSize: 20 }}>TEST OK</Text>
    </View>
  );
}
