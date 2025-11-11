declare module 'react-native-vector-icons/MaterialIcons' {
  import { Component } from 'react';
  import { TextStyle, ViewStyle, TextProps } from 'react-native';

  interface IconProps extends TextProps {
    /**
     * Size of the icon, can also be passed as fontSize in the style object.
     */
    size?: number;
    /**
     * Name of the icon to show.
     */
    name: string;
    /**
     * Color of the icon.
     */
    color?: string;
    /**
     * Additional styles to be applied to the icon.
     */
    style?: TextStyle | ViewStyle;
  }

  /**
   * Material Icons component
   */
  class Icon extends Component<IconProps> {
    static getImageSource(
      name: string,
      size?: number,
      color?: string,
    ): Promise<any>;
    static getRawGlyphMap(): { [name: string]: number };
    static loadFont(
      file?: string,
    ): Promise<void>;
    static hasIcon(name: string): boolean;
  }

  export default Icon;
}

declare module 'react-native-vector-icons/FontAwesome' {
  import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  export default MaterialIcons;
}

declare module 'react-native-vector-icons/Ionicons' {
  import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  export default MaterialIcons;
}

declare module 'react-native-vector-icons/Entypo' {
  import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  export default MaterialIcons;
}

declare module 'react-native-vector-icons/Feather' {
  import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  export default MaterialIcons;
}

declare module 'react-native-vector-icons/AntDesign' {
  import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  export default MaterialIcons;
}

declare module 'react-native-vector-icons/Octicons' {
  import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  export default MaterialIcons;
}

declare module 'react-native-vector-icons/FontAwesome5' {
  import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  export default MaterialIcons;
}

declare module 'react-native-vector-icons/FontAwesome5Pro' {
  import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  export default MaterialIcons;
}

declare module 'react-native-vector-icons/Foundation' {
  import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  export default MaterialIcons;
}

declare module 'react-native-vector-icons/Fontisto' {
  import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  export default MaterialIcons;
}

declare module 'react-native-vector-icons/EvilIcons' {
  import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  export default MaterialIcons;
}

declare module 'react-native-vector-icons/SimpleLineIcons' {
  import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  export default MaterialIcons;
}

declare module 'react-native-vector-icons/Zocial' {
  import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  export default MaterialIcons;
}

declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  export default MaterialIcons;
}
