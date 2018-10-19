import { NavBarModule } from './navbar/navbar';
import { FilterPaneModule } from './filter-pane/filter-pane';
import { QlikObjectModule } from './qlik-object/qlik-object';
import { RouteCardModule } from './route-card/route-card';
import { FilterSelectorModule } from './filter-selector/filter-selector';
import { VariableSelectionPaneModule } from './variable-selection-pane/variable-selection-pane';
import { VariableSelectorModule } from './variable-selector/variable-selector';

console.log(VariableSelectorModule);

export const SharedModule = angular
  .module('shared', [
    NavBarModule,
    QlikObjectModule,
    RouteCardModule,
    FilterPaneModule,
    FilterSelectorModule,
    VariableSelectionPaneModule,
    VariableSelectorModule,
  ])
  .name;
