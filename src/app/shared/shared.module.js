import { NavBarModule } from './navbar/navbar';
import { FilterPaneModule } from './filter-pane/filter-pane';
import { QlikObjectModule } from './qlik-object/qlik-object';
import { RouteCardModule } from './route-card/route-card';
import { VariableSelectionPaneModule } from './variable-selection-pane/variable-selection-pane';
import { VariableSelectorModule } from './variable-selector/variable-selector';
import { SdpFooterModule } from './sdp-footer/sdp-footer';

export const SharedModule = angular
  .module('shared', [
    NavBarModule,
    QlikObjectModule,
    RouteCardModule,
    FilterPaneModule,
    VariableSelectionPaneModule,
    VariableSelectorModule,
    SdpFooterModule,
  ])
  .name;
