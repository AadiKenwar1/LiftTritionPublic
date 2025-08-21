import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import PopupModal from "../PopupModal";
import { useSettings } from '../../context/SettingsContext';


export default function TextOnlyModal(props) {
  const { mode } = useSettings();
  return (
    <PopupModal>
        {props.title && <Text style={{marginBottom: 10, textAlign: 'center', fontSize: 20, fontWeight: 'bold',}}>{props.title}</Text>}
        <Text style={{marginBottom: 20, textAlign: 'center'}}>{props.text}</Text>
        <TouchableOpacity 
            style={{
              backgroundColor: mode === true ? "#2D9CFF" : '#4CD964',
              marginTop: 0,
              marginHorizontal: 5,
              paddingVertical: 10,
              paddingHorizontal: 30,
              borderRadius: 10,
              alignItems: "center",
              alignSelf: "center",
              minWidth: 120,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 4,
              borderWidth: 1.3,
              borderColor: 'black',
              borderBottomWidth: 4,
              borderBottomColor: 'black',
              borderBottomLeftRadius: 11,
              borderBottomRightRadius: 11,
            }}
            onPress={props.onClose}
          >
            <Text style={{
              color: "#fff",
              fontWeight: "600",
              fontSize: 16,
              fontFamily: 'Inter_600SemiBold',
            }}>
              Close
            </Text>
        </TouchableOpacity>
    </PopupModal>
  );
}
