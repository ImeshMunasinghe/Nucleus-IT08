import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ConnectionStatus } from '../types/types';
import { MINION_COLORS } from '../constants/constants';

interface ConnectionStatusProps {
  status: ConnectionStatus;
  deviceName?: string;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusProps> = ({
  status,
  deviceName
}) => {
  const getStatusColor = (): string => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return MINION_COLORS.success;
      case ConnectionStatus.CONNECTING:
        return MINION_COLORS.warning;
      case ConnectionStatus.ERROR:
        return MINION_COLORS.error;
      case ConnectionStatus.DISCONNECTED:
      default:
        return MINION_COLORS.text;
    }
  };

  const getStatusText = (): string => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return deviceName ? `Connected to ${deviceName}` : 'Connected';
      case ConnectionStatus.CONNECTING:
        return 'Connecting...';
      case ConnectionStatus.ERROR:
        return 'Connection Error';
      case ConnectionStatus.DISCONNECTED:
      default:
        return 'Disconnected';
    }
  };

  const getStatusIcon = (): string => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return '●';
      case ConnectionStatus.CONNECTING:
        return '○';
      case ConnectionStatus.ERROR:
        return '✕';
      case ConnectionStatus.DISCONNECTED:
      default:
        return '○';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.icon}>{getStatusIcon()}</Text>
      </View>
      <Text style={[styles.text, { color: getStatusColor() }]}>
        {getStatusText()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ConnectionStatusIndicator;
