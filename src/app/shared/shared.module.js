import { NavBarModule } from './navbar/navbar';
import { FilterPaneModule } from './filter-pane/filter-pane';
import { QlikObjectModule } from './qlik-object/qlik-object';
import { RouteCardModule } from './route-card/route-card';
import { FilterSelectorModule } from './filter-selector/filter-selector';

export const SharedModule = angular
  .module('shared', [
    NavBarModule,
    QlikObjectModule,
    RouteCardModule,
    FilterPaneModule,
    FilterSelectorModule
  ])
  .name;
