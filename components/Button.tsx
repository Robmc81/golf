import React from 'react';
import { StyleSheet, Text, Pressable, ActivityIndicator, View } from 'react-native';
import Colors from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style
}) => {
  const getContainerStyle = () => {
    const baseStyle = [styles.container];
    
    // Add variant styles
    if (variant === 'primary') {
      baseStyle.push(styles.primaryContainer);
    } else if (variant === 'secondary') {
      baseStyle.push(styles.secondaryContainer);
    } else if (variant === 'outline') {
      baseStyle.push(styles.outlineContainer);
    } else if (variant === 'text') {
      baseStyle.push(styles.textContainer);
    }
    
    // Add size styles
    if (size === 'small') {
      baseStyle.push(styles.smallContainer);
    } else if (size === 'large') {
      baseStyle.push(styles.largeContainer);
    }
    
    // Add full width style
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }
    
    // Add disabled style
    if (disabled) {
      baseStyle.push(styles.disabledContainer);
    }
    
    if (style) {
      baseStyle.push(style);
    }
    
    return baseStyle;
  };
  
  const getTextStyle = () => {
    const baseStyle = [styles.text];
    
    // Add variant styles
    if (variant === 'primary') {
      baseStyle.push(styles.primaryText);
    } else if (variant === 'secondary') {
      baseStyle.push(styles.secondaryText);
    } else if (variant === 'outline') {
      baseStyle.push(styles.outlineText);
    } else if (variant === 'text') {
      baseStyle.push(styles.textText);
    }
    
    // Add size styles
    if (size === 'small') {
      baseStyle.push(styles.smallText);
    } else if (size === 'large') {
      baseStyle.push(styles.largeText);
    }
    
    // Add disabled style
    if (disabled) {
      baseStyle.push(styles.disabledText);
    }
    
    return baseStyle;
  };
  
  return (
    <Pressable
      style={({ pressed }) => [
        ...getContainerStyle(),
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={variant === 'primary' || variant === 'secondary' ? '#fff' : Colors.primary} 
            style={styles.loader}
          />
        ) : (
          <>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={getTextStyle()}>{title}</Text>
          </>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryContainer: {
    backgroundColor: Colors.primary,
  },
  secondaryContainer: {
    backgroundColor: Colors.secondary,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  textContainer: {
    backgroundColor: 'transparent',
  },
  smallContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  largeContainer: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  fullWidth: {
    width: '100%',
  },
  disabledContainer: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: '#fff',
  },
  secondaryText: {
    color: '#fff',
  },
  outlineText: {
    color: Colors.primary,
  },
  textText: {
    color: Colors.primary,
  },
  smallText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  disabledText: {
    opacity: 0.8,
  },
  iconContainer: {
    marginRight: 8,
  },
  loader: {
    marginRight: 8,
  },
});