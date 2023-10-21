import NavigationItems from './NavigationItems';
import { NavigationProps, MenuItem } from './NavigationItems';

const ProductNavigation = ({}: NavigationProps) => {
  const menus: MenuItem[] = [];

  return <NavigationItems menus={menus} />;
};

export default ProductNavigation;