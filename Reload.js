import {View, Text} from 'react-native';
import React from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

const Reload = ({navigation}) => {
  useFocusEffect(() => {
    setTimeout(() => navigation.navigate('Home'), 4000);
  });
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.darker,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text>Reloading...</Text>
    </View>
  );
};

export default Reload;
