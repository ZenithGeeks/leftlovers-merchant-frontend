declare module 'react-native-vector-icons/FontAwesome5' {
  import { Icon } from 'react-native-vector-icons/Icon';
  import { ComponentClass } from 'react';

  export interface FontAwesome5Props {
    name: string;
    size?: number;
    color?: string;
    solid?: boolean;
    light?: boolean;
    brand?: boolean;
    style?: any;
  }

  const FontAwesome5: ComponentClass<FontAwesome5Props>;
  export default FontAwesome5;
}
