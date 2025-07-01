(function() {

    angular
        .module(
            'sphaApp', ['ui.router', 'ngTable', 'loadingSpinnerServiceSpha',
                'required', 'ckeditor', 'cityServicesSpha',
                'httpServicesSpha', 'customPopoverSpha',
                'versionableFileDirective',
                'uploadFilesDirectiveSpha',
                'xtForm', 'blockUI', 'ui.select', 'ui.utils.masks',
                'oitozero.ngSweetAlert','ui.bootstrap',
            ], configSphaApp)
        .constant('$extend', false)
        .run(['$templateCache', '$rootScope', function($templateCache, $rootScope) {
            
        	/* OVERRIDE TEMPLATE UI-SELECT-MATCH*/
    		$templateCache.put("bootstrap/match.tpl.html",
    				"<div class=\"ui-select-match\" ng-hide=\"$select.open && $select.searchEnabled\" ng-disabled=\"$select.disabled\" ng-class=\"{\'btn-default-focus\':$select.focus}\"><span tabindex=\"-1\" class=\"btn btn-default form-control ui-select-toggle\" aria-label=\"{{ $select.baseTitle }} activate\" ng-disabled=\"$select.disabled\" ng-click=\"$select.activate()\" style=\"outline: 0;\"><span ng-show=\"$select.isEmpty()\" class=\"ui-select-placeholder text-muted\">{{$select.placeholder}}</span> <span ng-hide=\"$select.isEmpty()\" class=\"ui-select-match-text pull-left\" ng-class=\"{\'ui-select-allow-clear\': $select.allowClear && !$select.isEmpty()}\" ng-transclude=\"\"></span> <i class=\"caret pull-right\" ng-click=\"$select.toggle($event)\"></i> <a ng-show=\"$select.allowClear && !$select.isEmpty() && ($select.disabled !== true)\" aria-label=\"{{ $select.baseTitle }} clear\" style=\"margin-right: 20px\" ng-click=\"$select.clear($event)\" class=\"btn btn-xs btn-link pull-right\"><i class=\"glyphicon glyphicon-remove\" aria-hidden=\"true\"></i></a></span></div>");
    		
    		/*      END TEMPLATE UI-SELECT-MATCH  */
    		
    		/* OVERRIDE TEMPLATE UI-SELECT MULTIPLE */
    		$templateCache.put("bootstrap/match-multiple.tpl.html",
					"<div class=\"ui-select-match inline-flex\"><div ng-repeat=\"$item in $select.selected track by $index\"><div class=\"ui-select-match-item ui-select-match-item-multiple ml-2 btn btn-default btn-xs\" tabindex=\"-1\" type=\"button\" ng-disabled=\"$select.disabled\" ng-click=\"$selectMultiple.activeMatchIndex = $index;\" ng-class=\"{\'btn-primary\':$selectMultiple.activeMatchIndex === $index, \'select-locked\':$select.isLocked(this, $index)}\" ui-select-sort=\"$select.selected\"><span class=\"close ui-select-match-close\" ng-hide=\"$select.disabled\" ng-click=\"$selectMultiple.removeChoice($index)\">&nbsp;&times;</span> <span uis-transclude-append=\"\"></span></div></div></div>");
    		/*      END TEMPLATE UI-SELECT-MULTIPLE  */
    		
    		/*      OVERRIDE TEMPLATE UI-BLOCK           */
    		$templateCache.put('angular-block-ui/angular-block-ui.ng.html', '<div class=\"block-ui-overlay\"></div><div class=\"block-ui-message-container\"><img src=\"modules/spha/images/loading.gif\"/></div>');
    		/*      END OVERRIDE TEMPLATE UI-BLOCK       */
    		
    		
    		$templateCache.put('xtForm/inline/validationInline.html',
    			    '<div data-ng-show="showErrors">\n' +
    			    '    <span style="color: red;margin-top: 5px;display: inline-block;" data-ng-repeat="error in errors" data-key="error.key"><i class="fa fa-exclamation-circle" aria-hidden="true"></i><span translate="{{error.message}}"></span></span>\n' +
    			    '</div>');
    		
    		$templateCache.put('xtForm/summary/validationSummary.html',
    			    '<div class="panel panel-danger" ng-style="showErrors ? {} : {\'visibility\':\'hidden\'}">\n' +
    			    '    <div class="panel-heading">\n' +
    			    '		<a href="" ng-click="open= !open">\n'	+
    			    '        <h3 class="panel-title">\n' +
    			    '            <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>\n' +
    			    '            Errori di validazione\n' +
    			    '		 	<div class="pull-right">\n'+
    				'				<i class="glyphicon" ng-class="{\'glyphicon-chevron-down\': open, \'glyphicon-chevron-right\': !open}"></i>\n'+
    				'			</div>\n'+
    			    '        </h3>\n' +
    			    '		</a>\n'+
    			    '    </div>\n' +
    			    '    <div class="panel-body" ng-show="open">\n' +
    			    '        <ul class="xt-validation-summary">\n' +
    			    '            <li data-ng-repeat="error in errors" data-key="{{error.key}}">\n' +
    			    '                <span data-ng-show="showLabel" >{{error.label | translate}}</span>\n' +
    			    '                -\n' +
    			    '                <span translate="{{error.message | translate}}"></span>\n' +
    			    '            </li>\n' +
    			    '        </ul>\n' +
    			    '    </div>\n' +
    			    '</div>');
    	
    		
    		 //RIMUOVE I TOOLTIP QUANDO SI CAMBIA STATO
            $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams, error) {
            	$('.tooltip').remove();
            });
            
            	
            }])
        .config(
            [
                'xtFormConfigProvider',
                'blockUIConfig',
                function(xtFormConfigProvider, blockUIConfig) {

                    /**
                     * BlockUI Active only for request with url
                     * contains "ossc-web" and "acc-web"
                     *
                     */
                    blockUIConfig.requestFilter = function(config) {
                        // Perform a global, case-insensitive search
                        // on the request url for 'noblockui' ...
                        if (config.block) {
                            return true;
                        }
                        if (config.url.indexOf("ossc-web") > 0) {
                            return true;
                        } else if (config.url.indexOf("acc-web") > 0) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    
                    /* OVERRIDE XTFORM PLUGIN SETTINGS */
                    var errors = {
                        minlength: "{{ 'MIN_LENGTH_MESSAGE' | translate}} {{ngMinlength}}",
                        maxlength: "{{ 'MAX_LENGTH_MESSAGE' | translate}} {{ngMaxlength}}",
                        required: "{{'REQUIRE_MESSAGE' | translate }}",
                        number: "{{'NUMBER_MESSAGE' | translate }}",
                        min: "{{ 'MIN_MESSAGE' | translate }} {{min}}",
                        max: "{{ 'MAX_MESSAGE' | translate }} {{max}}",
                        email: "{{'EMAIL_MESSAGE' | translate }}",
                        pattern: "{{'PATTERN_MESSAGE' | translate }} {{ngPattern}}",
                        url: "{{'URL_MESSAGE' | translate }}",
                        date: "{{'DATE_MESSAGE' | translate }}",
                        dateDisabled: "{{'DATE_MESSAGE' | translate }}",
                        datetimelocal: "{{'DATE_MESSAGE' | translate }}",
                        time: "{{'TIME_MESSAGE' | translate }}",
                        week: "{{'WEEK_MESSAGE' | translate }}",
                        month: "{{'MONTH_MESSAGE' | translate }}",
                        $$server: "{{'SERVER_MESSAGE' | translate }}"
                    };
                    xtFormConfigProvider.setErrorMessages(errors);
                    // Add custom validation strategy
                    xtFormConfigProvider
                        .addValidationStrategy(
                            'customStrategy',
                            function(form, ngModel) {
                                return ngModel.$focused ||
                                    (form.$invalid && form.$submitted);
                            });
                    /* END OVERRIDE XTFORM */

                }
            ])

    .$inject = ['$stateProvider', '$controllerProvider'];

    function configSphaApp($stateProvider, $controllerProvider) {
         $controllerProvider.allowGlobals();
        var moduleName = "spha";
        var translationCommon = "common";
        var translationProcedimenti = "procedimenti";
        var translationRectification = "rectification";
        var translationMedicine = "medicine";
        var translationInnovative = "innovative";
        var translationDownload = "download";
        var translationCompany = "company";
        var translationOrphan = "orphan";
        var translationScadenzeBrevettuali = "scadenzeBrevettuali";
        var translationGsdbdf = "gsdbdf";
        var translationApp = "spha";
        var proceduresTypes = "procedures_types"
        var translationTransparency = "transparency";
        var translationGSDP = "gsdp";
        var translationPromofarma = "promofarma";
        var translationMonth = "month";
        var translationNSIS = "NSIS";
        var translationMEAs = "meas";
        var translationCE = "CE";
        var translationFSN = "FSN";
        var translationFFI = "FFI";
        var translationImportCSV = "importCSV";
        var translationPayback = "payback";
        var translationStatistiche = "statistiche";
        var translationRipianoFase2 = "ripianoFase2";

        $stateProvider
            .state('spha.home', {
                    url: '/home',
                    ncyBreadcrumb: {
                        label: "{{'MENU.ROOT' | translate}}",
                        parent: 'dashboard.home'
                    },
                    views: {
                        'content': {
                            templateUrl: './modules/spha/html/sphaHome.html',
                            controller: 'sphaHomeCtrl'
                        },
                        'menu': {
                            templateUrl: './modules/menu/html/menu.html',
                            controller: 'menuCtrl'
                        }
                    },
                    resolve: {
                        translate: ['RequireTranslations',
                            function(RequireTranslations) {
                                RequireTranslations("home", moduleName);
                            }
                        ],
                        '': [
                            '$ocLazyLoad',
                            function($ocLazyLoad) {
                                return $ocLazyLoad
                                    .load({
                                        name: '',
                                        files: [
                                            'modules/spha/js/controllers/sphaHomeCtrl.js',
                                            'modules/spha/js/services/sphaVersionService.js',
                                        ]
                                    });
                            }
                        ]
                    }
                })
            .state('spha.debug', {
                url: '/home/debug',
                ncyBreadcrumb: {
                    label: 'DEBUG',
                    parent: 'dashboard.home'
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/sphaDebugHome.html',
                        controller: 'sphaDebugCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/sphaVersionService.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/sphaDebugCtrl.js',
                                ],
                                serie: true,
                            },
                        ]);
                    }]
                }
            })
            .state('spha.searchProcedimenti', {
                url: '/procedimenti/search',
                ncyBreadcrumb: {
                    label: '{{"PROCEDIMENTI_SEARCH" | translate}}',
                    parent: 'spha.home'
                },
                params: {},
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/procedimenti/sphaSearchProcedimenti.html',
                        controller: 'sphaSearchProcedimentiCtrl',
                        controllerAs: 'procedimentiCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationProcedimenti, translationApp);
                        RequireTranslations(translationProcedimenti + "/" + proceduresTypes, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/services/sphaProcedureServices.js',
                                    'modules/spha/js/services/uploadFilesServicesSpha.js',
                                    'modules/spha/js/directives/edit_history/editHistory.js',
                                    'modules/spha/js/directives/state_history/stateHistory.js',
                                    'modules/spha/js/directives/objections_history/objectionsHistory.js',
                                    'modules/spha/js/directives/history_delegation/historyDelegation.js',
                                    'modules/spha/js/directives/tableOperations/tableOperations.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/procedimenti/sphaSearchProcedimentiCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
            .state('spha.newProcedimenti', {
                url: '/procedimenti/new',
                ncyBreadcrumb: {
                    label: '{{"NEW_PROCEDURE" | translate}}',
                    parent: 'spha.searchProcedimenti'
                },
                params: {},
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/procedimenti/sphaProcedureNew.html',
                        controller: 'sphaProcedureNewCtrl',
                        controllerAs: 'procedureCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationProcedimenti, translationApp);
                        RequireTranslations(translationProcedimenti + "/" + proceduresTypes, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/services/sphaProcedureServices.js',
                                    'modules/spha/js/services/uploadFilesServicesSpha.js',
                                    'modules/spha/js/directives/procedure/sphaProcedure.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/procedimenti/sphaProcedureNewCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
            .state('spha.procedureEdit', {
                url: '/procedimenti/{id:int}/edit',
                ncyBreadcrumb: {
                    label: '{{"EDIT_PROCEDURE" | translate}}',
                    parent: 'spha.searchProcedimenti'
                },
                params: {},
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/procedimenti/sphaProcedureEdit.html',
                        controller: 'sphaProcedureEditCtrl',
                        controllerAs: 'procedureCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationProcedimenti, translationApp);
                        RequireTranslations(translationProcedimenti + "/" + proceduresTypes, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/sphaProcedureServices.js',
                                    'modules/spha/js/services/uploadFilesServicesSpha.js',
                                    'modules/spha/js/directives/procedure/sphaProcedure.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/services/sphaPaymentServices.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/procedimenti/sphaProcedureEditCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
            .state('spha.procedureDetail', {
                url: '/procedimenti/:id/detail',
                ncyBreadcrumb: {
                    label: '{{"PROCEDURE_VIEW_TITLE" | translate}}',
                    parent: 'spha.searchProcedimenti'
                },
                params: {},
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/procedimenti/sphaProcedureDetail.html',
                        controller: 'sphaProcedureDetailCtrl',
                        controllerAs: 'procedureCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationProcedimenti, translationApp);
                        RequireTranslations(translationProcedimenti + "/" + proceduresTypes, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/uploadFilesServicesSpha.js',
                                    'modules/spha/js/services/sphaProcedureServices.js',
                                    'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                    'modules/spha/js/directives/procedure/sphaProcedure.js',
                                    'modules/spha/js/services/sphaPaymentServices.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/procedimenti/sphaProcedureDetailCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
            .state('spha.procedureFilesList', {
                url: '/procedimenti/:id/files?{showImportButton:bool}',
                ncyBreadcrumb: {
                    label: '{{"PROCEDURE_VIEW_TITLE" | translate}}',
                    parent: 'spha.searchProcedimenti'
                },
                params: {},
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/procedimenti/sphaProcedureFilesList.html',
                        controller: 'sphaProcedureFilesListCtrl',
                        controllerAs: 'procedureCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationProcedimenti, translationApp);
                        RequireTranslations(translationProcedimenti + "/" + proceduresTypes, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/uploadFilesServicesSpha.js',
                                    'modules/spha/js/services/sphaProcedureServices.js',
                                    'modules/spha/js/directives/procedure/procedure-files.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/procedimenti/sphaProcedureFilesListCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
            .state('spha.procedureFilesEdit', {
                url: '/procedimenti/:id/edit-files?{showImportButton:bool}',
                ncyBreadcrumb: {
                    label: '{{"EDIT_PROCEDURE" | translate}}',
                    parent: 'spha.searchProcedimenti'
                },
                params: {},
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/procedimenti/sphaProcedureFilesEdit.html',
                        controller: 'sphaProcedureFilesEditCtrl',
                        controllerAs: 'procedureCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationProcedimenti, translationApp);
                        RequireTranslations(translationProcedimenti + "/" + proceduresTypes, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/uploadFilesServicesSpha.js',
                                    'modules/spha/js/services/sphaProcedureServices.js',
                                    'modules/spha/js/directives/procedure/procedure-files.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/procedimenti/sphaProcedureFilesEditCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
			.state('spha.budgetProcedureInstanceView', {
                url: '/instance/budget/view',

                ncyBreadcrumb: {
                    label: '{{"BUDGET" | translate}}',
                    parent: 'spha.searchProcedimenti'
                },
                params: {
                    type:"BUDGET"
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/procedimenti/sphaProcedureInstance.html',
                        controller: 'sphaProcedureInstanceCtrl',
                        controllerAs: 'ctrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function( RequireTranslations ){
                        RequireTranslations( translationCommon, translationApp );
                        RequireTranslations( translationProcedimenti, translationApp );
                        RequireTranslations( translationCompany, translationApp );
                    }],
                    '':['$ocLazyLoad', function ($ocLazyLoad){
                        return 	$ocLazyLoad.load([
                                {
                                    name:'dependencies',
                                    files:[
                                        'modules/spha/js/services/propertiesServiceSpha.js',
                                        'modules/spha/js/services/shareDataServices.js',
                                        'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                        'modules/spha/js/services/sphaCompanyServices.js',
                                        'modules/spha/js/services/sphaPaybackServices.js'
                                    ],
                                    serie: true,
                                },
                                {
                                    name:'controller',
                                    files:[
                                        'modules/spha/js/controllers/procedimenti/sphaProcedureInstanceCtrl.js',
                                    ],
                                    serie: true,
                                }
                            ]
                        );
                    }]
                }
            })
			.state('spha.shelfProcedureInstanceView', {
                url: '/instance/shelf/view',
                ncyBreadcrumb: {
                    label: '{{"SHELF" | translate}}',
                    parent: 'spha.searchProcedimenti'
                },
                params: {
                    type:"SHELF"
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/procedimenti/sphaProcedureInstance.html',
                        controller: 'sphaProcedureInstanceCtrl',
                        controllerAs: 'ctrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function( RequireTranslations ){
                        RequireTranslations( translationCommon, translationApp );
                        RequireTranslations( translationProcedimenti, translationApp );
                        RequireTranslations( translationCompany, translationApp );
                    }],
                    '':['$ocLazyLoad', function ($ocLazyLoad){
                        return 	$ocLazyLoad.load([
                                {
                                    name:'dependencies',
                                    files:[
                                        'modules/spha/js/services/propertiesServiceSpha.js',
                                        'modules/spha/js/services/shareDataServices.js',
                                        'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                        'modules/spha/js/services/sphaCompanyServices.js',
                                        'modules/spha/js/services/sphaPaybackServices.js'
                                    ],
                                    serie: true,
                                },
                                {
                                    name:'controller',
                                    files:[
                                        'modules/spha/js/controllers/procedimenti/sphaProcedureInstanceCtrl.js',
                                    ],
                                    serie: true,
                                }
                            ]
                        );
                    }]
                }
            })
            .state('spha.pb5ProcedureInstanceView', {
                url: '/instance/pb5/view',

                ncyBreadcrumb: {
                    label: '{{"PB5" | translate}}',
                    parent: 'spha.searchProcedimenti'
                },
                params: {
                    type:"PB5"
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/procedimenti/sphaProcedureInstance.html',
                        controller: 'sphaProcedureInstanceCtrl',
                        controllerAs: 'ctrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function( RequireTranslations ){
                        RequireTranslations( translationCommon, translationApp );
                        RequireTranslations( translationProcedimenti, translationApp );
                        RequireTranslations( translationCompany, translationApp );
                    }],
                    '':['$ocLazyLoad', function ($ocLazyLoad){
                        return 	$ocLazyLoad.load([
                                {
                                    name:'dependencies',
                                    files:[
                                        'modules/spha/js/services/propertiesServiceSpha.js',
                                        'modules/spha/js/services/shareDataServices.js',
                                        'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                        'modules/spha/js/services/sphaCompanyServices.js',
                                        'modules/spha/js/services/sphaPaybackServices.js'
                                    ],
                                    serie: true,
                                },
                                {
                                    name:'controller',
                                    files:[
                                        'modules/spha/js/controllers/procedimenti/sphaProcedureInstanceCtrl.js',
                                    ],
                                    serie: true,
                                }
                            ]
                        );
                    }]
                }
            })
            .state('spha.pb183ProcedureInstanceView', {
                url: '/instance/pb183/view',

                ncyBreadcrumb: {
                    label: '{{"PB183" | translate}}',
                    parent: 'spha.searchProcedimenti'
                },
                params: {
                    type:"PB183"
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/procedimenti/sphaProcedureInstance.html',
                        controller: 'sphaProcedureInstanceCtrl',
                        controllerAs: 'ctrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function( RequireTranslations ){
                        RequireTranslations( translationCommon, translationApp );
                        RequireTranslations( translationProcedimenti, translationApp );
                        RequireTranslations( translationCompany, translationApp );
                    }],
                    '':['$ocLazyLoad', function ($ocLazyLoad){
                        return 	$ocLazyLoad.load([
                                {
                                    name:'dependencies',
                                    files:[
                                        'modules/spha/js/services/propertiesServiceSpha.js',
                                        'modules/spha/js/services/shareDataServices.js',
                                        'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                        'modules/spha/js/services/sphaCompanyServices.js',
                                        'modules/spha/js/services/sphaPaybackServices.js'
                                    ],
                                    serie: true,
                                },
                                {
                                    name:'controller',
                                    files:[
                                        'modules/spha/js/controllers/procedimenti/sphaProcedureInstanceCtrl.js',
                                    ],
                                    serie: true,
                                }
                            ]
                        );
                    }]
                }
            })
            .state('spha.submitProcedureInstanceDocs', {
                url: '/instance/submit',

                ncyBreadcrumb: {
                    label: '{{"SUBMIT_PROCEDURE" | translate}}',
                    parent: 'spha.shelfProcedureInstanceView'
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/procedimenti/sphaSubmitProcedureInstance.html',
                        controller: 'sphaSubmitProcedureInstanceCtrl',
                        controllerAs: 'ctrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function( RequireTranslations ){
                        RequireTranslations( translationCommon, translationApp );
                        RequireTranslations( translationProcedimenti, translationApp );
                        RequireTranslations( translationCompany, translationApp );
                    }],
                    '':['$ocLazyLoad', function ($ocLazyLoad){
                        return 	$ocLazyLoad.load([
                                {
                                    name:'dependencies',
                                    files:[
                                    	'modules/spha/js/services/propertiesServiceSpha.js',
                                        'modules/spha/js/services/shareDataServices.js',
                                        'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                        'modules/spha/js/services/sphaUtilsServices.js',
                                        'modules/spha/js/services/uploadFilesServicesSpha.js',
                                    ],
                                    serie: true,
                                },
                                {
                                    name:'controller',
                                    files:[
                                        'modules/spha/js/controllers/procedimenti/sphaSubmitProcedureInstanceCtrl.js',
                                    ],
                                    serie: true,
                                }
                            ]
                        );
                    }]
                }
            })
            .state('spha.searchMedicine', {
                url: '/medicine/search?{procedureInstanceId:int}&{idRectification:int}',
                ncyBreadcrumb: {
                    label: '{{"MEDICINE_SEARCH" | translate}}',
                    parent: 'spha.home'
                },
                params: {
                    result: { squash: true, value: null },
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/medicine/sphaSearchMedicine.html',
                        controller: 'sphaSearchMedicineCtrl',
                        controllerAs: 'medicineCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations( translationRectification, translationApp );
                        RequireTranslations(translationProcedimenti, translationApp);
                        RequireTranslations(translationMedicine, translationApp);
                        RequireTranslations(translationCommon, translationApp);
                        
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/services/sphaMedicineServices.js',
                                    'modules/spha/js/services/sphaCompanyServices.js',
                                    'modules/spha/js/services/sphaPossibleValueServices.js',
                                    'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                    'modules/spha/js/services/sphaRectificationServices.js',
                                    'modules/spha/js/services/sphaUtilsServices.js',
                                    'modules/spha/js/directives/tableOperations/tableOperations.js',
                                    'modules/spha/js/services/uploadFilesServicesSpha.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/abstractControllers/sphaRectifiableAnagraphicController.js',
                                    'modules/spha/js/controllers/medicine/sphaSearchMedicineCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
			.state('spha.viewMedicine', {
                url: '/medicine/view?aic9&{procedureInstanceId:int}&{idRectification:int}',
                ncyBreadcrumb: {
                    label: '{{"MEDICINE_DETAIL" | translate}}',
                    parent: 'spha.searchMedicine'
                },
                params: {
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/medicine/sphaMedicineDetail.html',
                        controller: 'sphaMedicineDetailCtrl',
                        controllerAs: 'medicineCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function( RequireTranslations ){
                        RequireTranslations( translationCommon, translationApp );
                        RequireTranslations( translationMedicine, translationApp );
                        RequireTranslations(translationProcedimenti, translationApp);
                        RequireTranslations( translationRectification, translationApp );
                    }],
                    '':['$ocLazyLoad', function ($ocLazyLoad){
                        return 	$ocLazyLoad.load([
                                {
                                    name:'dependencies',
                                    files:[
                                        'modules/spha/js/services/propertiesServiceSpha.js',
                                        'modules/spha/js/services/shareDataServices.js',
                                        'modules/spha/js/services/sphaMedicineServices.js',
                                        'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                        'modules/spha/js/services/sphaRectificationServices.js',
                                        'modules/spha/js/services/sphaUtilsServices.js',
                                        'modules/spha/js/services/uploadFilesServicesSpha.js',
                                    ],
                                    serie: true,
                                },
                                {
                                    name:'controller',
                                    files:[
                                        'modules/spha/js/controllers/abstractControllers/sphaAbstractRectifiableAnagraphicDetailController.js',
                                        'modules/spha/js/controllers/medicine/sphaMedicineDetailCtrl.js',
                                    ],
                                    serie: true,
                                }
                            ]
                        );
                    }]
                }
			})
            .state('spha.searchTransparency', {
                url: '/liste-trasparenza/search?{procedureInstanceId:int}&{idRectification:int}',
                ncyBreadcrumb: {
                    label: '{{"TRASPARENZE_SEARCH" | translate}}',
                    parent: 'spha.home'
                },
                params: {
                    result: {squash: true, value: null},
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/transparency/sphaSearchTransparency.html',
                        controller: 'sphaSearchTransparencyCtrl',
                        controllerAs: 'transparencyCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function (RequireTranslations) {
                        RequireTranslations( translationRectification, translationApp );                        
                        RequireTranslations(translationProcedimenti, translationApp);
                        RequireTranslations(translationTransparency, translationApp);
                        RequireTranslations(translationCommon, translationApp);
                    }],
                    '': ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                            name: 'dependencies',
                            files: [
                                'modules/spha/js/services/propertiesServiceSpha.js',
                                'modules/spha/js/services/shareDataServices.js',
                                'modules/spha/js/services/sphaTransparencyServices.js',
                                'modules/spha/js/directives/tableOperations/tableOperations.js',
                                'modules/spha/js/services/sphaMedicineServices.js',
                                'modules/spha/js/services/sphaPossibleValueServices.js',
                                'modules/spha/js/services/sphaCompanyServices.js',
                                'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                'modules/spha/js/services/sphaRectificationServices.js',
                                'modules/spha/js/services/sphaUtilsServices.js',
                                'modules/spha/js/services/uploadFilesServicesSpha.js',
                            ],
                            serie: true,
                        },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/transparency/sphaSearchTransparencyCtrl.js',
                                    'modules/spha/js/controllers/abstractControllers/sphaRectifiableAnagraphicController.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
            .state('spha.viewTransparency', {
                url: '/liste-trasparenza/view?aic9&{procedureInstanceId:int}&{idRectification:int}',
                ncyBreadcrumb: {
                    label: '{{"TRASPARENZE_DETAIL" | translate}}',
                    parent: 'spha.searchTransparency'
                },
                params: {
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/transparency/sphaDetailTransparency.html',
                        controller: 'sphaTransparencyDetailCtrl',
                        controllerAs: 'transparencyCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function( RequireTranslations ){
                        RequireTranslations( translationCommon, translationApp );
                        RequireTranslations(translationProcedimenti, translationApp);
                        RequireTranslations( translationRectification, translationApp );
                        RequireTranslations( translationTransparency, translationApp );
                    }],
                    '':['$ocLazyLoad', function ($ocLazyLoad){
                        return 	$ocLazyLoad.load([
                                {
                                    name:'dependencies',
                                    files:[
                                        'modules/spha/js/services/propertiesServiceSpha.js',
                                        'modules/spha/js/services/shareDataServices.js',
                                        'modules/spha/js/services/sphaTransparencyServices.js',
                                        'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                        'modules/spha/js/services/sphaRectificationServices.js',
                                        'modules/spha/js/services/sphaUtilsServices.js',
                                    ],
                                    serie: true,
                                },
                                {
                                    name:'controller',
                                    files:[
                                        'modules/spha/js/controllers/abstractControllers/sphaAbstractRectifiableAnagraphicDetailController.js',
                                        'modules/spha/js/controllers/transparency/sphaDetailTransparencyCtrl.js',
                                    ],
                                    serie: true,
                                }
                            ]
                        );
                    }]
                }
            })
            .state('spha.searchPatentExpire', {
                url: '/scadenze-brevettuali/search',
                ncyBreadcrumb: {
                    label: '{{"PATENT_EXPIRY_SEARCH" | translate}}',
                    parent: 'spha.home'
                },
                params: {
                    result: { squash: true, value: null },
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/scadenzeBrevettuali/sphaSearchScadenzeBrevettuali.html',
                        controller: 'sphaSearchScadenzeBrevettuali',
                        controllerAs: 'scadenzeBrevettualiCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationScadenzeBrevettuali, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/directives/tableOperations/tableOperations.js',
                                    'modules/spha/js/services/sphaPossibleValueServices.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/services/sphaPatentExpirationServices.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/scadenzeBrevettuali/sphaSearchScadenzeBrevettualiCtrl.js'
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
            .state('spha.searchGsdbdf', {
                url: '/gsdbdf/search?{procedureInstanceId:int}&{idRectification:int}',
                ncyBreadcrumb: {
                    label: '{{"GSDBDF_SEARCH" | translate}}',
                    parent: 'spha.home'
                },
                params: {
                    result: { squash: true, value: null },
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/gsdbdf/sphaSearchGsdbdf.html',
                        controller: 'sphaSearchGsdbdfCtrl',
                        controllerAs: 'gsdbdfCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations( translationRectification, translationApp );
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationProcedimenti, translationApp);
                        RequireTranslations(translationGsdbdf, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/directives/tableOperations/tableOperations.js',
                                    'modules/spha/js/services/sphaGsdbdfServices.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/services/sphaUtilsServices.js',
                                    'modules/spha/js/services/sphaCompanyServices.js',
                                    'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                    'modules/spha/js/services/sphaRectificationServices.js'
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/gsdbdf/sphaSearchGsdbdfCtrl.js'
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
            .state('spha.searchCompany', {
                url: '/company/search?{procedureInstanceId:int}&{idRectification:int}',
                ncyBreadcrumb: {
                    label: '{{"COMPANY_SEARCH" | translate}}',
                    parent: 'spha.home'
                },
                params: {
                    result: {squash: true, value: null},
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/company/sphaSearchCompany.html',
                        controller: 'sphaSearchCompanyCtrl',
                        controllerAs: 'companyCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function( RequireTranslations ){
                        RequireTranslations( translationCommon, translationApp );
                        RequireTranslations(translationProcedimenti, translationApp);
                        RequireTranslations( translationRectification, translationApp );
                        RequireTranslations( translationCompany, translationApp );
                    }],
                    '':['$ocLazyLoad', function ($ocLazyLoad){
                        return 	$ocLazyLoad.load([
                                {
                                    name:'dependencies',
                                    files:[
                                        'modules/spha/js/services/sphaCompanyServices.js',
                                        'modules/spha/js/services/propertiesServiceSpha.js',
                                        'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                        'modules/spha/js/directives/tableOperations/tableOperations.js',
                                    ],
                                    serie:true,
                                },
                                {
                                    name:'controller',
                                    files:[
                                        'modules/spha/js/controllers/company/sphaSearchCompanyCtrl.js',
                                    ],
                                    serie:true,
                                }
                            ]
                        );
                    }]
                }
            })
            .state('spha.detailCompany', {
                url: '/company/detail?{procedureInstanceId:int}&{idRectification:int}',
                ncyBreadcrumb: {
                    label: '{{"COMPANY_DETAIL" | translate}}',
                    parent: 'spha.home'
                },
                params: {
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/company/sphaDetailCompany.html',
                        controller: 'sphaDetailCompanyCtrl',
                        controllerAs: 'companyCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function( RequireTranslations ){
                        RequireTranslations( translationCommon, translationApp );
                        RequireTranslations(translationProcedimenti, translationApp);
                        RequireTranslations( translationRectification, translationApp );
                        RequireTranslations( translationCompany, translationApp );
                    }],
                    '':['$ocLazyLoad', function ($ocLazyLoad){
                        return 	$ocLazyLoad.load([
                                {
                                    name:'dependencies',
                                    files:[
                                    	'modules/spha/js/services/sphaCompanyServices.js',
                                        'modules/spha/js/services/propertiesServiceSpha.js',
                                        'modules/spha/js/services/shareDataServices.js',
                                        'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                        'modules/spha/js/services/sphaRectificationServices.js',
                                        'modules/spha/js/services/sphaUtilsServices.js',
                                    ],
                                    serie:true,
                                },
                                {
                                    name:'controller',
                                    files:[
                                        'modules/spha/js/controllers/company/sphaDetailCompanyCtrl.js',
                                    ],
                                    serie:true,
                                }
                            ]
                        );
                    }]
                }
            })
            .state('spha.searchOrphan', {
                url: '/orphan/search?{procedureInstanceId:int}&{idRectification:int}',
                ncyBreadcrumb: {
                    label: '{{"ORPHAN_SEARCH" | translate}}',
                    parent: 'spha.home'
                },
                params: {
                    result: {squash: true, value: null},
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/orphan/sphaSearchOrphan.html',
                        controller: 'sphaSearchOrphanCtrl',
                        controllerAs: 'orphanCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function( RequireTranslations ){
                        RequireTranslations( translationRectification, translationApp );
                        RequireTranslations(translationProcedimenti, translationApp);
                        RequireTranslations( translationOrphan, translationApp );
                        RequireTranslations( translationCommon, translationApp );
                    }],
                    '':['$ocLazyLoad', function ($ocLazyLoad){
                        return 	$ocLazyLoad.load([
                                {
                                    name:'dependencies',
                                    files:[
                                        'modules/spha/js/services/propertiesServiceSpha.js',
                                        'modules/spha/js/services/shareDataServices.js',
                                        'modules/spha/js/services/sphaOrphanServices.js',
                                        'modules/spha/js/directives/tableOperations/tableOperations.js',
                                        'modules/spha/js/services/sphaCompanyServices.js',
                                        'modules/spha/js/services/sphaMedicineServices.js',
                                        'modules/spha/js/services/sphaPossibleValueServices.js',
                                        'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                        'modules/spha/js/services/sphaRectificationServices.js',
                                        'modules/spha/js/services/sphaUtilsServices.js',
                                        'modules/spha/js/services/uploadFilesServicesSpha.js',
                                    ],
                                    serie:true,
                                },
                                {
                                    name:'controller',
                                    files:[
                                        'modules/spha/js/controllers/abstractControllers/sphaRectifiableAnagraphicController.js',
                                        'modules/spha/js/controllers/orphan/sphaSearchOrphanCtrl.js',
                                    ],
                                    serie:true,
                                }
                            ]
                        );
                    }]
                }
            })
            .state('spha.viewOrphan', {
                url: '/orphan/view?aic9&{procedureInstanceId:int}&{idRectification:int}',
                ncyBreadcrumb: {
                    label: '{{"ORPHAN_DETAIL" | translate}}',
                    parent: 'spha.searchOrphan'
                },
                params: {
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/orphan/sphaOrphanDetail.html',
                        controller: 'sphaOrphanDetailCtrl',
                        controllerAs: 'orphanCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function( RequireTranslations ){
                        RequireTranslations( translationCommon, translationApp );
                        RequireTranslations(translationProcedimenti, translationApp);
                        RequireTranslations( translationRectification, translationApp );
                        RequireTranslations( translationOrphan, translationApp );
                    }],
                    '':['$ocLazyLoad', function ($ocLazyLoad){
                        return 	$ocLazyLoad.load([
                                {
                                    name:'dependencies',
                                    files:[
                                        'modules/spha/js/services/propertiesServiceSpha.js',
                                        'modules/spha/js/services/shareDataServices.js',
                                        'modules/spha/js/services/sphaOrphanServices.js',
                                        'modules/spha/js/directives/therapeuticIndicationsList/therapeuticIndicationsList.js',
                                        'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                        'modules/spha/js/services/sphaRectificationServices.js',
                                        'modules/spha/js/services/sphaUtilsServices.js',
                                        'modules/spha/js/services/uploadFilesServicesSpha.js',
                                    ],
                                    serie: true,
                                },
                                {
                                    name:'controller',
                                    files:[
                                        'modules/spha/js/controllers/abstractControllers/sphaAbstractRectifiableAnagraphicDetailController.js',
                                        'modules/spha/js/controllers/orphan/sphaOrphanDetailCtrl.js',
                                    ],
                                    serie: true,
                                }
                            ]
                        );
                    }]
                }
			})
            .state('spha.searchInnovative', {
                url: '/innovative/search?{procedureInstanceId:int}&{idRectification:int}',
                ncyBreadcrumb: {
                    label: '{{"INNOVATIVE_SEARCH" | translate}}',
                    parent: 'spha.home'
                },
                params: {
                    result: { squash: true, value: null },
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/innovative/sphaSearchInnovative.html',
                        controller: 'sphaSearchInnovativeCtrl',
                        controllerAs: 'innovativeCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations( translationRectification, translationApp );                        
                        RequireTranslations(translationProcedimenti, translationApp);
                        RequireTranslations(translationInnovative, translationApp);
                        RequireTranslations(translationCommon, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/services/sphaCompanyServices.js',
                                    'modules/spha/js/services/sphaMedicineServices.js',
                                    'modules/spha/js/directives/tableOperations/tableOperations.js',
                                    'modules/spha/js/services/sphaPossibleValueServices.js',
                                    'modules/spha/js/services/sphaInnovativeServices.js',
                                    'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                    'modules/spha/js/services/sphaRectificationServices.js',
                                    'modules/spha/js/services/sphaUtilsServices.js',
                                    'modules/spha/js/services/uploadFilesServicesSpha.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/abstractControllers/sphaRectifiableAnagraphicController.js',
                                    'modules/spha/js/controllers/innovative/sphaSearchInnovativeCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
            .state('spha.viewInnovative', {
                url: '/innovative/view?aic9&{procedureInstanceId:int}&{idRectification:int}',
                ncyBreadcrumb: {
                    label: '{{"INNOVATIVE_DETAIL" | translate}}',
                    parent: 'spha.searchInnovative'
                },
                params: {
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/innovative/sphaInnovativeDetail.html',
                        controller: 'sphaInnovativeDetailCtrl',
                        controllerAs: 'innovativeCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function( RequireTranslations ){
                        RequireTranslations( translationCommon, translationApp );
                        RequireTranslations(translationProcedimenti, translationApp);
                        RequireTranslations( translationRectification, translationApp );
                        RequireTranslations( translationInnovative, translationApp );
                    }],
                    '':['$ocLazyLoad', function ($ocLazyLoad){
                        return 	$ocLazyLoad.load([
                                {
                                    name:'dependencies',
                                    files:[
                                        'modules/spha/js/services/propertiesServiceSpha.js',
                                        'modules/spha/js/services/shareDataServices.js',
                                        'modules/spha/js/services/sphaInnovativeServices.js',
                                        'modules/spha/js/directives/therapeuticIndicationsList/therapeuticIndicationsList.js',
                                        'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                        'modules/spha/js/services/sphaRectificationServices.js',
                                        'modules/spha/js/services/sphaUtilsServices.js'
                                    ],
                                    serie: true,
                                },
                                {
                                    name:'controller',
                                    files:[
                                        'modules/spha/js/controllers/abstractControllers/sphaAbstractRectifiableAnagraphicDetailController.js',
                                        'modules/spha/js/controllers/innovative/sphaInnovativeDetailCtrl.js',
                                    ],
                                    serie: true,
                                }
                            ]
                        );
                    }]
                }
            })
            .state('spha.gsdpList', {
                url: '/gsdp/search',
                ncyBreadcrumb: {
                    label: '{{"GSDP_SEARCH" | translate}}',
                    parent: 'spha.home'
                },
                params: {
                    result: {squash: true, value: null},
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/gsdp/sphaSearchGSDP.html',
                        controller: 'sphaSearchGSDPCtrl',
                        controllerAs: 'gsdpCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function (RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationGSDP, translationApp);
                    }],
                    '': ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                            name: 'dependencies',
                            files: [
                                'modules/spha/js/services/propertiesServiceSpha.js',
                                'modules/spha/js/services/uploadFilesServicesSpha.js',
                                'modules/spha/js/services/sphaGSDPServices.js',
                                'modules/spha/js/services/sphaGsdbdfServices.js',
                                'modules/spha/js/services/shareDataServices.js',
                                'modules/spha/js/directives/dragandrop/dragdrop.js',
                                'modules/spha/js/services/sphaUtilsServices.js',
                            ],
                            serie: true,
                        },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/gsdp/sphaSearchGSDPCtrl.js'
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
            .state('spha.sphaDownloadArea', {
                url: '/download',
                ncyBreadcrumb: {
                    label: '{{"DOWNLOAD_SEARCH" | translate}}',
                    parent: 'spha.home'
                },
                params: {
                    result: { squash: true, value: null },
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/download/sphaDownloadArea.html',
                        controller: 'sphaDownloadAreaCtrl',
                        controllerAs: 'downloadCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationDownload, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/directives/tableOperations/tableOperations.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/download/sphaDownloadAreaCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
            .state('spha.searchPromofarmaA', {
                url: '/promofarmaA/search',
                ncyBreadcrumb: {
                    label: '{{"PROMOFARMA_A_FLOW" | translate}}',
                    parent: 'spha.home'
                },
                params: {
                	type:"A"
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/promofarma/sphaSearchPromofarmaA.html',
                        controller: 'sphaSearchPromofarmaACtrl',
                        controllerAs: 'promofarmaCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationPromofarma, translationApp);
                        RequireTranslations(translationMonth, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/sphaMedicineServices.js',
                                    'modules/spha/js/services/sphaCompanyServices.js',
                                    'modules/spha/js/services/sphaPossibleValueServices.js',
                                    'modules/spha/js/services/sphaPromofarmaServices.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                    'modules/spha/js/directives/tableOperations/tableOperations.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/promofarma/sphaSearchPromofarmaACtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
            .state('spha.searchPromofarmaB', {
                url: '/promofarmaB/search',
                ncyBreadcrumb: {
                    label: '{{"PROMOFARMA_B_FLOW" | translate}}',
                    parent: 'spha.home'
                },
                params: {
                	type:"B"
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/promofarma/sphaSearchPromofarmaB.html',
                        controller: 'sphaSearchPromofarmaBCtrl',
                        controllerAs: 'promofarmaCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationPromofarma, translationApp);
                        RequireTranslations(translationMonth, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/sphaMedicineServices.js',
                                    'modules/spha/js/services/sphaCompanyServices.js',
                                    'modules/spha/js/services/sphaPossibleValueServices.js',
                                    'modules/spha/js/services/sphaPromofarmaServices.js',
                                    'modules/spha/js/services/sphaMonthServices.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                    'modules/spha/js/directives/tableOperations/tableOperations.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/promofarma/sphaSearchPromofarmaBCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
            .state('spha.searchNSIS', {
                url: '/nsis/search',
                ncyBreadcrumb: {
                    label: '{{"NSIS_SEARCH" | translate}}',
                    parent: 'spha.home'
                },
                params: {
                    result: { squash: true, value: null },
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/NSIS/sphaSearchNSIS.html',
                        controller: 'sphaSearchNSISCtrl',
                        controllerAs: 'NSISCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationNSIS, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/directives/tableOperations/tableOperations.js',
                                    'modules/spha/js/services/sphaCompanyServices.js',
                                    'modules/spha/js/services/sphaMedicineServices.js',
                                    'modules/spha/js/services/sphaPossibleValueServices.js',
                                    'modules/spha/js/services/sphaNsisServices.js',
                                    'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/NSIS/sphaSearchNSISCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
            .state('spha.searchMEAs', {
                url: '/meas/search',
                ncyBreadcrumb: {
                    label: '{{"MEAS_FLOW" | translate}}',
                    parent: 'spha.home'
                },
                params: {
                    result: { squash: true, value: null },
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/meas/sphaSearchMEAs.html',
                        controller: 'sphaSearchMEAsCtrl',
                        controllerAs: 'measCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationMEAs, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/services/sphaCompanyServices.js',
                                    'modules/spha/js/services/sphaPossibleValueServices.js',
                                    'modules/spha/js/services/sphaMedicineServices.js',
                                    'modules/spha/js/directives/tableOperations/tableOperations.js',
                                    'modules/spha/js/services/sphaMeasServices.js',
                                    'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/meas/sphaSearchMEAsCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
            .state('spha.searchCE', {
                url: '/ce/search',
                ncyBreadcrumb: {
                    label: '{{"CE_SEARCH" | translate}}',
                    parent: 'spha.home'
                },
                params: {
                    result: { squash: true, value: null },
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/CE/sphaSearchCE.html',
                        controller: 'sphaSearchCECtrl',
                        controllerAs: 'CECtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationCE, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/directives/tableOperations/tableOperations.js',
                                    'modules/spha/js/directives/flows/flows.js',
                                    'modules/spha/js/services/sphaCeServices.js',
                                    'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/CE/sphaSearchCECtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
            .state('spha.searchFSN', {
                url: '/fsn/search',
                ncyBreadcrumb: {
                    label: '{{"FSN_SEARCH" | translate}}',
                    parent: 'spha.home'
                },
                params: {
                    result: { squash: true, value: null },
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/FSN/sphaSearchFSN.html',
                        controller: 'sphaSearchFSNCtrl',
                        controllerAs: 'FSNCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationFSN, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/directives/tableOperations/tableOperations.js',
                                    'modules/spha/js/directives/flows/flows.js',
                                    'modules/spha/js/services/sphaFsnServices.js',
                                    'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/FSN/sphaSearchFSNCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
            .state('spha.searchFFI', {
                url: '/ffi/search',
                ncyBreadcrumb: {
                    label: '{{"FFI_SEARCH" | translate}}',
                    parent: 'spha.home'
                },
                params: {
                    result: { squash: true, value: null },
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/FFI/sphaSearchFFI.html',
                        controller: 'sphaSearchFFICtrl',
                        controllerAs: 'FFICtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationFFI, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/directives/tableOperations/tableOperations.js',
                                    'modules/spha/js/directives/flows/flows.js',
                                    'modules/spha/js/services/sphaFfiServices.js',
                                    'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/FFI/sphaSearchFFICtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
            .state('spha.gsdpSubmit', {
                url: '/gsdp/:id/submit',
                ncyBreadcrumb: {
                    label: '{{"GSDP_VIEW_TITLE" | translate}}',
                    parent: 'spha.home'
                },
                params: {},
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/gsdp/sphaSubmitGSDP.html',
                        controller: 'sphaSubmitGSDPCtrl',
                        controllerAs: 'gsdpCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationGSDP, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                            name: 'dependencies',
                            files: [
                                'modules/spha/js/services/propertiesServiceSpha.js',
                                'modules/spha/js/services/uploadFilesServicesSpha.js',
                                'modules/spha/js/services/sphaGSDPServices.js',
                                'modules/spha/js/directives/upload-multi-files-actions/uploadMultiFileActions.js',

                            ],
                            serie: true,
                        },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/gsdp/sphaSubmitGSDPCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
            .state('spha.gsdpSignConnector', {
                url: '/gsdp/signConnector',
                ncyBreadcrumb: {
                    label: '{{"SIGN" | translate}}',
                    parent: 'spha.home'
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/gsdp/sphaGSDPSignConnector.html',
                        controller: 'sphaGSDPSignConnectorCtrl',
                        controllerAs: 'gsdpCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function (RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationGSDP, translationApp);
                    }],
                    '': ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/httpServicesSpha.js'
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/gsdp/sphaGSDPSignConnectorCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
            .state('spha.importCSV', {
                url: '/importcsv',
                ncyBreadcrumb: {
                    label: '{{"IMPORTCSV" | translate}}',
                    parent: 'spha.home'
                },
                params: {
                    result: { squash: true, value: null },
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/importCSV/sphaImportCsv.html',
                        controller: 'sphaImportCsvCtrl',
                        controllerAs: 'importCsvCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationImportCSV, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/services/uploadFilesServicesSpha.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/importCSV/sphaImportCsvCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            }).state('spha.searchRectification', {
                url: '/rectification/search?rectificationType&{idRectification:int}&rectificationId&{docOnly:bool}',
                ncyBreadcrumb: {
                    label: '{{"RECTIFICATION_MANAGE" | translate}}',
                    parent: 'spha.home'
                },
                params: {},
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/rectification/sphaSearchRectification.html',
                        controller: 'sphaSearchRectificationCtrl',
                        controllerAs: 'rectificationCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                	translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationRectification, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                	'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/services/sphaCompanyServices.js',
                                    'modules/spha/js/services/sphaGsdbdfServices.js',
                                    'modules/spha/js/services/sphaRectificationServices.js',
                                    'modules/spha/js/services/sphaUtilsServices.js',
                                    'modules/spha/js/directives/rectification/sphaRectification.js',
                                    'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                    
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/rectification/sphaSearchRectificationCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
            .state('spha.closeRectification', {
                url: '/rectification/close',
                ncyBreadcrumb: {
                    label: '{{"CLOSE_RECTIFICATION" | translate}}',
                    parent: 'spha.home'
                },
                params: {},
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/rectification/sphaCloseRectification.html',
                        controller: 'sphaCloseRectificationCtrl',
                        controllerAs: 'closeRectificationCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                	translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationRectification, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                	'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/services/sphaRectificationServices.js',
                                    'modules/spha/js/services/sphaUtilsServices.js',
                                    'modules/spha/js/services/uploadFilesServicesSpha.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/rectification/sphaCloseRectificationCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            }).state('spha.submitRectification', {
                url: '/rectification/submit',
                ncyBreadcrumb: {
                    label: '{{"SUBMIT_RECTIFICATION" | translate}}',
                    parent: 'spha.home'
                },
                params: {},
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/rectification/sphaSubmitRectification.html',
                        controller: 'sphaSubmitRectificationCtrl',
                        controllerAs: 'submitRectificationCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                	translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationRectification, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                	'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/services/sphaRectificationServices.js',
                                    'modules/spha/js/services/sphaUtilsServices.js',
                                    'modules/spha/js/services/uploadFilesServicesSpha.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/rectification/sphaSubmitRectificationCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            }).state('spha.submitAcceptance', {
                url: '/acceptance/submit',
                ncyBreadcrumb: {
                    label: '{{"SUBMIT_ACCEPTANCE" | translate}}',
                    parent: 'spha.home'
                },
                params: {},
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/payback/sphaSubmitAcceptance.html',
                        controller: 'sphaSubmitAcceptanceCtrl',
                        controllerAs: 'submitAcceptanceCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                	translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationPayback, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                	'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/services/sphaPaybackServices.js',
                                    'modules/spha/js/services/sphaUtilsServices.js',
                                    'modules/spha/js/services/uploadFilesServicesSpha.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/payback/sphaSubmitAcceptanceCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
            .state('spha.rectificationSignConnector', {
                url: '/rectification/signConnector',
                ncyBreadcrumb: {
                    label: '{{"SIGN" | translate}}',
                    parent: 'spha.home'
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/rectification/sphaRectificationSignConnector.html',
                        controller: 'sphaRectificationSignConnectorCtrl',
                        controllerAs: 'rectificationCtrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function (RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationRectification, translationApp);
                    }],
                    '': ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/httpServicesSpha.js',
                                    'modules/spha/js/services/sphaRectificationServices.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/services/sphaUtilsServices.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/rectification/sphaRectificationSignConnectorCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
                .state('spha.acceptanceSignConnector', {
                    url: '/acceptance/signConnector',
                    ncyBreadcrumb: {
                        label: '{{"SIGN" | translate}}',
                        parent: 'spha.home'
                    },
                    views: {
                        'content': {
                            templateUrl: './modules/spha/html/payback/sphaAcceptanceSignConnector.html',
                            controller: 'sphaAcceptanceSignConnectorCtrl',
                            controllerAs: 'acceptanceCtrl'
                        },
                        'menu': {
                            templateUrl: './modules/menu/html/menu.html',
                            controller: 'menuCtrl'
                        }
                    },
                    resolve: {
                        translate: ['RequireTranslations', function (RequireTranslations) {
                            RequireTranslations(translationCommon, translationApp);
                            RequireTranslations(translationRectification, translationApp);
                        }],
                        '': ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                {
                                    name: 'dependencies',
                                    files: [
                                        'modules/spha/js/services/propertiesServiceSpha.js',
                                        'modules/spha/js/services/httpServicesSpha.js',
                                        'modules/spha/js/services/sphaPaybackServices.js',
                                        'modules/spha/js/services/shareDataServices.js',
                                        'modules/spha/js/services/sphaUtilsServices.js',
                                    ],
                                    serie: true,
                                },
                                {
                                    name: 'controller',
                                    files: [
                                        'modules/spha/js/controllers/payback/sphaAcceptanceSignConnectorCtrl.js',
                                    ],
                                    serie: true,
                                }
                            ]);
                        }]
                    }
            }).state('spha.procedureInstanceSignConnector', {
                url: '/procedure-instances/signConnector',
                ncyBreadcrumb: {
                    label: '{{"SIGN" | translate}}',
                    parent: 'spha.home'
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/procedimenti/sphaProcedureInstanceSignConnector.html',
                        controller: 'sphaProcedureInstanceSignConnectorCtrl',
                        controllerAs: 'ctrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function (RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationProcedimenti, translationApp);
                    }],
                    '': ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/httpServicesSpha.js',
                                    'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/services/sphaUtilsServices.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/procedimenti/sphaProcedureInstanceSignConnectorCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            }).state('spha.sphaProcedureReport', {
                url: '/procedimenti/report',
                ncyBreadcrumb: {
                    label: '{{"PROCEDIMENTI_REPORT" | translate}}',
                    parent: 'spha.home'
                },
                params: {},
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/procedimenti/sphaReportProcedimenti.html',
                        controller: 'sphaReportProcedimentiCtrl',
                        controllerAs: 'ctrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationProcedimenti, translationApp);
                        RequireTranslations(translationProcedimenti + "/" + proceduresTypes, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/services/sphaProcedureServices.js',
                                    'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                    'modules/spha/js/services/uploadFilesServicesSpha.js',
                                    'modules/spha/js/directives/edit_history/editHistory.js',
                                    'modules/spha/js/directives/state_history/stateHistory.js',
                                    'modules/spha/js/directives/objections_history/objectionsHistory.js',
                                    'modules/spha/js/directives/history_delegation/historyDelegation.js',
                                    'modules/spha/js/directives/tableOperations/tableOperations.js',
                                    'modules/spha/js/services/sphaCompanyServices.js',

                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/procedimenti/sphaReportProcedimentiCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
            .state('spha.viewSummaryData', {
                url: '/summary-data?{procedureType}?{queryType}?{procedureId:int}&{procedureInstanceId:int}',
                ncyBreadcrumb: {
                    label: '{{"SUMMARY_DATA_LABEL" | translate}}',
                    parent: function (payback)
                    {
                        var procedureType = payback.$resolve.$stateParams.procedureType.toLowerCase();
                        return 'spha.'+ procedureType + 'ProcedureInstanceView';
                    }
                },
                
                params: {
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/payback/sphaSummaryData.html',
                        controller: 'sphaSummaryDataCtrl',
                        controllerAs: 'ctrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function( RequireTranslations ){
                        RequireTranslations( translationCommon, translationApp );
                        RequireTranslations( translationProcedimenti, translationApp);
                        RequireTranslations( translationPayback, translationApp );
                    }],
                    '':['$ocLazyLoad', function ($ocLazyLoad){
                        return 	$ocLazyLoad.load([
                                {
                                    name:'dependencies',
                                    files:[
                                        'modules/spha/js/services/propertiesServiceSpha.js',
                                        'modules/spha/js/services/shareDataServices.js',
                                        'modules/spha/js/services/sphaUtilsServices.js',
                                        'modules/spha/js/services/uploadFilesServicesSpha.js',
                                        'modules/spha/js/services/sphaCompanyServices.js',
                                        'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                        'modules/spha/js/services/sphaProcedureServices.js',
                                        'modules/spha/js/directives/filterPayback/sphaFilterPayback.js',
                                        'modules/spha/js/directives/tablePayback/sphaTablePayback.js',
                                        'modules/spha/js/services/sphaPossibleValueServices.js',
                                        'modules/spha/js/services/sphaPaybackServices.js',
                                    ],
                                    serie: true,
                                },
                                {
                                    name:'controller',
                                    files:[
                                        'modules/spha/js/controllers/abstractControllers/sphaSecondPhaseProcedureController.js',
                                        'modules/spha/js/controllers/payback/sphaSummaryDataCtrl.js',
                                    ],
                                    serie: true,
                                }
                            ]
                        );
                    }]
                }
            })
            .state('spha.viewPaybackData', {
                url: '/payback-data?{procedureType}?{queryType}?{procedureId:int}&{procedureInstanceId:int}',               
                ncyBreadcrumb: {
                    label: '{{"PAYBACK_IMPORT" | translate}}',
                    parent: function (payback)
                    {
                        var procedureType = payback.$resolve.$stateParams.procedureType.toLowerCase();
                        return 'spha.'+ procedureType + 'ProcedureInstanceView';
                    } 
                },
                
                params: {
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/payback/sphaPaybackData.html',
                        controller: 'sphaPaybackDataCtrl',
                        controllerAs: 'ctrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function( RequireTranslations ){
                        RequireTranslations( translationCommon, translationApp );
                        RequireTranslations( translationProcedimenti, translationApp);
                        RequireTranslations( translationPayback, translationApp );
                    }],
                    '':['$ocLazyLoad', function ($ocLazyLoad){
                        return 	$ocLazyLoad.load([
                                {
                                    name:'dependencies',
                                    files:[
                                        'modules/spha/js/services/propertiesServiceSpha.js',
                                        'modules/spha/js/services/shareDataServices.js',
                                        'modules/spha/js/services/sphaUtilsServices.js',
                                        'modules/spha/js/services/uploadFilesServicesSpha.js',
                                        'modules/spha/js/services/sphaCompanyServices.js',
                                        'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                        'modules/spha/js/services/sphaProcedureServices.js',
                                        'modules/spha/js/directives/filterPayback/sphaFilterPayback.js',
                                        'modules/spha/js/directives/tablePayback/sphaTablePayback.js',
                                        'modules/spha/js/services/sphaPossibleValueServices.js',
                                        'modules/spha/js/services/sphaPaybackServices.js',
                                    ],
                                    serie: true,
                                },
                                {
                                    name:'controller',
                                    files:[
                                        'modules/spha/js/controllers/abstractControllers/sphaSecondPhaseProcedureController.js',
                                        'modules/spha/js/controllers/payback/sphaPaybackDataCtrl.js',
                                    ],
                                    serie: true,
                                }
                            ]
                        );
                    }]
                }
            })
            .state('spha.paymentAifaManagement', {
                url: '/payment-aifa?{procedureType}?{queryType}?{procedureId:int}',
                ncyBreadcrumb: {
                    label: '{{"VERSARE" | translate}}',
                    parent: function (payback)
                    {
                        if(payback.$resolve.$stateParams.procedureType) {
                            var procedureType = payback.$resolve.$stateParams.procedureType.toLowerCase();
                            return 'spha.'+ procedureType + 'ProcedureInstanceView';
                        } else return 'spha.home';
                        
                    } 
                },
                params: {
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/payback/sphaPaybackAifaPayment.html',
                        controller: 'sphaPaybackAifaPaymentCtrl',
                        controllerAs: 'ctrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function( RequireTranslations ){
                        RequireTranslations( translationCommon, translationApp );
                        RequireTranslations( translationProcedimenti, translationApp);
                        RequireTranslations( translationPayback, translationApp );
                    }],
                    '':['$ocLazyLoad', function ($ocLazyLoad){
                        return 	$ocLazyLoad.load([
                                {
                                    name:'dependencies',
                                    files:[
                                        'modules/spha/js/services/propertiesServiceSpha.js',
                                        'modules/spha/js/services/shareDataServices.js',
                                        'modules/spha/js/services/sphaUtilsServices.js',
                                        'modules/spha/js/services/uploadFilesServicesSpha.js',
                                        'modules/spha/js/services/sphaCompanyServices.js',
                                        'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                        'modules/spha/js/services/sphaProcedureServices.js',
                                        'modules/spha/js/directives/filterPayback/sphaFilterPayback.js',
                                        'modules/spha/js/services/sphaPossibleValueServices.js',
                                        'modules/spha/js/directives/payback/sphaPayment.js',
                                        'modules/spha/js/services/sphaPaymentServices.js',

                                    ],
                                    serie: true,
                                },
                                {
                                    name:'controller',
                                    files:[
                                        'modules/spha/js/controllers/abstractControllers/sphaSecondPhaseProcedureController.js',
                                        'modules/spha/js/controllers/payback/sphaPaybackAifaPaymentCtrl.js',
                                    ],
                                    serie: true,
                                }
                            ]
                        );
                    }]
                }
            })
            .state('spha.acceptanceAifaManagement', {
                url: '/acceptance-aifa?{procedureInstanceId:int}?{queryType}?{procedureId:int}',
                ncyBreadcrumb: {
                    label: '{{"PAYBACK_ACCEPTANCE" | translate}}',
                    parent: function (payback)
                    {
                        if(payback.$resolve.$stateParams.procedureType) {
                            var procedureType = payback.$resolve.$stateParams.procedureType.toLowerCase();
                            return 'spha.'+ procedureType + 'ProcedureInstanceView';
                        } else return 'spha.home';
                        
                    } 
                },
                params: {
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/payback/sphaPaybackAifaAcceptance.html',
                        controller: 'sphaPaybackAifaAcceptanceCtrl',
                        controllerAs: 'ctrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function( RequireTranslations ){
                        RequireTranslations( translationCommon, translationApp );
                        RequireTranslations( translationProcedimenti, translationApp);
                        RequireTranslations( translationPayback, translationApp );
                    }],
                    '':['$ocLazyLoad', function ($ocLazyLoad){
                        return 	$ocLazyLoad.load([
                                {
                                    name:'dependencies',
                                    files:[
                                        'modules/spha/js/services/propertiesServiceSpha.js',
                                        'modules/spha/js/services/shareDataServices.js',
                                        'modules/spha/js/services/sphaUtilsServices.js',
                                        'modules/spha/js/services/uploadFilesServicesSpha.js',
                                        'modules/spha/js/services/sphaCompanyServices.js',
                                        'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                        'modules/spha/js/services/sphaProcedureServices.js',
                                        'modules/spha/js/directives/filterPayback/sphaFilterPayback.js',
                                        'modules/spha/js/services/sphaPossibleValueServices.js',
                                        'modules/spha/js/directives/payback/sphaPayment.js',
                                        'modules/spha/js/services/sphaPaybackServices.js',
                                        'modules/spha/js/services/sphaProcedureInstanceServices.js',

                                    ],
                                    serie: true,
                                },
                                {
                                    name:'controller',
                                    files:[
                                        'modules/spha/js/controllers/abstractControllers/sphaSecondPhaseProcedureController.js',
                                        'modules/spha/js/controllers/payback/sphaPaybackAifaAcceptanceCtrl.js',
                                    ],
                                    serie: true,
                                }
                            ]
                        );
                    }]
                }
            })
            .state('spha.paymentManagement', {
                url: '/payment?{procedureType}?{queryType}?{procedureId:int}',
                ncyBreadcrumb: {
                    label: '{{"VERSARE" | translate}}',
                    parent: function (payback)
                    {
                        if(payback.$resolve.$stateParams.procedureType) {
                            var procedureType = payback.$resolve.$stateParams.procedureType.toLowerCase();
                            return 'spha.'+ procedureType + 'ProcedureInstanceView';
                        } else return 'spha.home';
                        
                    } 
                },
                params: {
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/payback/sphaPaybackPayment.html',
                        controller: 'sphaPaybackPaymentCtrl',
                        controllerAs: 'ctrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function( RequireTranslations ){
                        RequireTranslations( translationCommon, translationApp );
                        RequireTranslations( translationProcedimenti, translationApp);
                        RequireTranslations( translationPayback, translationApp );
                    }],
                    '':['$ocLazyLoad', function ($ocLazyLoad){
                        return 	$ocLazyLoad.load([
                                {
                                    name:'dependencies',
                                    files:[
                                        'modules/spha/js/services/propertiesServiceSpha.js',
                                        'modules/spha/js/services/shareDataServices.js',
                                        'modules/spha/js/services/sphaUtilsServices.js',
                                        'modules/spha/js/services/uploadFilesServicesSpha.js',
                                        'modules/spha/js/services/sphaCompanyServices.js',
                                        'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                        'modules/spha/js/services/sphaProcedureServices.js',
                                        'modules/spha/js/directives/filterPayback/sphaFilterPayback.js',
                                        'modules/spha/js/services/sphaPossibleValueServices.js',
                                        'modules/spha/js/directives/payback/sphaPayment.js',
                                        'modules/spha/js/services/sphaPaymentServices.js',

                                    ],
                                    serie: true,
                                },
                                {
                                    name:'controller',
                                    files:[
                                        'modules/spha/js/controllers/abstractControllers/sphaSecondPhaseProcedureController.js',
                                        'modules/spha/js/controllers/payback/sphaPaybackPaymentCtrl.js',
                                    ],
                                    serie: true,
                                }
                            ]
                        );
                    }]
                }
            })
            .state('spha.paymentFeeSignConnector', {
                url: '/payment-fee/signConnector',
                ncyBreadcrumb: {
                    label: '{{"SIGN" | translate}}',
                    parent: 'spha.submitPayment'
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/payback/sphaPaymentSignConnector.html',
                        controller: 'sphaPaymentFeeSignConnectorCtrl',
                        controllerAs: 'ctrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function (RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationProcedimenti, translationApp);
                        RequireTranslations( translationPayback, translationApp );
                    }],
                    '': ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            {
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/httpServicesSpha.js',
                                    'modules/spha/js/services/sphaPaymentServices.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/services/sphaUtilsServices.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/payback/sphaPaymentSignConnectorCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            })
            .state('spha.submitPayment', {
                url: '/payment/submit?{procedureType}?{queryType}?{procedureId}',

                ncyBreadcrumb: {
                    label: '{{"SUBMIT_PAYMENT" | translate}}',
                    parent: 'spha.paymentManagement'
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/payback/sphaSubmitPayment.html',
                        controller: 'sphaSubmitPaymentCtrl',
                        controllerAs: 'ctrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function( RequireTranslations ){
                        RequireTranslations( translationCommon, translationApp );
                        RequireTranslations( translationProcedimenti, translationApp);
                        RequireTranslations( translationPayback, translationApp );
                    }],
                    '':['$ocLazyLoad', function ($ocLazyLoad){
                        return 	$ocLazyLoad.load([
                                {
                                    name:'dependencies',
                                    files:[
                                    	'modules/spha/js/services/propertiesServiceSpha.js',
                                        'modules/spha/js/services/shareDataServices.js',
                                        'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                        'modules/spha/js/services/sphaUtilsServices.js',
                                        'modules/spha/js/services/uploadFilesServicesSpha.js',
                                        'modules/spha/js/services/sphaPaymentServices.js',
                                    ],
                                    serie: true,
                                },
                                {
                                    name:'controller',
                                    files:[
                                        'modules/spha/js/controllers/payback/sphaSubmitPaymentCtrl.js'
                                    ],
                                    serie: true,
                                }
                            ]
                        );
                    }]
                }
            }).state('spha.viewPaymentFee', {
                url: '/payment-fees/detail?paymentId?{procedureType}?{queryType}',

                ncyBreadcrumb: {
                    label: '{{"VIEW_PAYMENT_FEE" | translate}}',
                    parent: 'spha.paymentManagement'
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/payback/sphaViewPaymentFee.html',
                        controller: 'sphaViewPaymentFeeCtrl',
                        controllerAs: 'ctrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function( RequireTranslations ){
                        RequireTranslations( translationCommon, translationApp );
                        RequireTranslations( translationProcedimenti, translationApp);
                        RequireTranslations( translationPayback, translationApp );
                    }],
                    '':['$ocLazyLoad', function ($ocLazyLoad){
                        return 	$ocLazyLoad.load([
                                {
                                    name:'dependencies',
                                    files:[
                                    	'modules/spha/js/services/propertiesServiceSpha.js',
                                        'modules/spha/js/services/shareDataServices.js',
                                        'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                        'modules/spha/js/services/sphaUtilsServices.js',
                                        'modules/spha/js/services/uploadFilesServicesSpha.js',
                                        'modules/spha/js/services/sphaPaymentServices.js',
                                        'modules/spha/js/directives/payback/sphaPayment.js',
                                    ],
                                    serie: true,
                                },
                                {
                                    name:'controller',
                                    files:[
                                        'modules/spha/js/controllers/payback/sphaViewPaymentFeeCtrl.js'
                                    ],
                                    serie: true,
                                }
                            ]
                        );
                    }]
                }
            }).state('spha.sphaProcedurePB5PaymentReport', {
                url: '/procedure-payment/report/pb5',
                ncyBreadcrumb: {
                    label: '{{"PAYMENT_PB5_REPORT" | translate}}',
                    parent: 'spha.home'
                },
                params: {
                    type:"PB5"
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/payback/sphaProcedurePaymentReport.html',
                        controller: 'sphaProcedurePaymentReportCtrl',
                        controllerAs: 'ctrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations( translationCommon, translationApp );
                        RequireTranslations( translationProcedimenti, translationApp);
                        RequireTranslations( translationPayback, translationApp );
                        RequireTranslations(translationProcedimenti + "/" + proceduresTypes, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/services/sphaCompanyServices.js',
                                    'modules/spha/js/services/sphaPaymentServices.js',
                                    'modules/spha/js/directives/payback/sphaPayment.js',
                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/payback/sphaProcedurePaymentReportCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            }).state('spha.sphaProcedureSHELFPaymentReport', {
                url: '/procedure-payment/report/shelf',
                ncyBreadcrumb: {
                    label: '{{"PAYMENT_SHELF_REPORT" | translate}}',
                    parent: 'spha.home'
                },
                params: {
                    type:"SHELF"
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/payback/sphaProcedurePaymentReport.html',
                        controller: 'sphaProcedurePaymentReportCtrl',
                        controllerAs: 'ctrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations( translationCommon, translationApp );
                        RequireTranslations( translationProcedimenti, translationApp);
                        RequireTranslations( translationPayback, translationApp );
                        RequireTranslations(translationProcedimenti + "/" + proceduresTypes, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/services/sphaCompanyServices.js',
                                    'modules/spha/js/services/sphaPaymentServices.js',
                                    'modules/spha/js/directives/payback/sphaPayment.js',

                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/payback/sphaProcedurePaymentReportCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            }).state('spha.sphaProcedurePB183PaymentReport', {
                url: '/procedure-payment/report/pb183',
                ncyBreadcrumb: {
                    label: '{{"PAYMENT_PB183_REPORT" | translate}}',
                    parent: 'spha.home'
                },
                params: {
                    type:"PB183"
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/payback/sphaProcedurePaymentReport.html',
                        controller: 'sphaProcedurePaymentReportCtrl',
                        controllerAs: 'ctrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations( translationCommon, translationApp );
                        RequireTranslations( translationProcedimenti, translationApp);
                        RequireTranslations( translationPayback, translationApp );
                        RequireTranslations(translationProcedimenti + "/" + proceduresTypes, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/services/sphaCompanyServices.js',
                                    'modules/spha/js/services/sphaPaymentServices.js',
                                    'modules/spha/js/directives/payback/sphaPayment.js',

                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/payback/sphaProcedurePaymentReportCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            }).state('spha.sphaPaybackAcceptance', {
                url: '/payback/acceptance',
                ncyBreadcrumb: {
                    label: '{{"PAYBACK_ACCEPTANCE" | translate}}',
                    parent: 'spha.home'
                },
                params: {
                    type:"SHELF"
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/payback/sphaPaybackAcceptance.html',
                        controller: 'sphaPaybackAcceptanceCtrl',
                        controllerAs: 'ctrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations( translationCommon, translationApp );
                        RequireTranslations( translationProcedimenti, translationApp);
                        RequireTranslations( translationPayback, translationApp );
                        RequireTranslations(translationProcedimenti + "/" + proceduresTypes, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/services/sphaCompanyServices.js',
                                    'modules/spha/js/services/sphaPaymentServices.js',
                                    'modules/spha/js/services/sphaPaybackServices.js',                                    
                                    'modules/spha/js/services/sphaUtilsServices.js',

                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/payback/sphaPaybackAcceptanceCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            }).state('spha.sphaRipianoSpesaMese', {
                url: '/ripiano-spesa-mese?{procedureType}?{queryType}?{procedureId:int}&{procedureInstanceId:int}',               
                ncyBreadcrumb: {
                    label: '{{"RIPIANO_SPESA_MESE" | translate}}',
                    parent: function (payback)
                    {
                        var procedureType = payback.$resolve.$stateParams.procedureType.toLowerCase();
                        return 'spha.'+ procedureType + 'ProcedureInstanceView';
                    } 
                },
                
                params: {
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/ripianoFase2/sphaRipianoSpesaMese.html',
                        controller: 'sphaRipianoSpesaMeseCtrl',
                        controllerAs: 'ctrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function( RequireTranslations ){
                        RequireTranslations( translationCommon, translationApp );
                        RequireTranslations( translationProcedimenti, translationApp);
                        RequireTranslations( translationRipianoFase2, translationApp);                        
                        RequireTranslations( translationPayback, translationApp );
                    }],
                    '':['$ocLazyLoad', function ($ocLazyLoad){
                        return 	$ocLazyLoad.load([
                                {
                                    name:'dependencies',
                                    files:[
                                        'modules/spha/js/services/propertiesServiceSpha.js',
                                        'modules/spha/js/services/shareDataServices.js',
                                        'modules/spha/js/services/sphaUtilsServices.js',
                                        'modules/spha/js/services/uploadFilesServicesSpha.js',
                                        'modules/spha/js/services/sphaCompanyServices.js',
                                        'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                        'modules/spha/js/services/sphaProcedureServices.js',
                                        'modules/spha/js/directives/filterPayback/sphaFilterPayback.js',
                                        'modules/spha/js/directives/tablePayback/sphaTablePayback.js',
                                        'modules/spha/js/services/sphaPossibleValueServices.js',
                                        'modules/spha/js/services/sphaPaybackServices.js',
                                    ],
                                    serie: true,
                                },
                                {
                                    name:'controller',
                                    files:[
                                        'modules/spha/js/controllers/abstractControllers/sphaSecondPhaseProcedureController.js',
                                        'modules/spha/js/controllers/ripianoFase2/sphaRipianoSpesaMeseCtrl.js',
                                    ],
                                    serie: true,
                                }
                            ]
                        );
                    }]
                }
            }).state('spha.sphaRipianoSpesa', {
                url: '/ripiano-spesa?{procedureType}?{queryType}?{procedureId:int}&{procedureInstanceId:int}',               
                ncyBreadcrumb: {
                    label: '{{"RIPIANO_SPESA_ANNO" | translate}}',
                    parent: function (payback)
                    {
                        var procedureType = payback.$resolve.$stateParams.procedureType.toLowerCase();
                        return 'spha.'+ procedureType + 'ProcedureInstanceView';
                    } 
                },
                
                params: {
                },
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/ripianoFase2/sphaRipianoSpesa.html',
                        controller: 'sphaRipianoSpesaCtrl',
                        controllerAs: 'ctrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function( RequireTranslations ){
                        RequireTranslations( translationCommon, translationApp );
                        RequireTranslations( translationProcedimenti, translationApp);
                        RequireTranslations( translationRipianoFase2, translationApp);  
                        RequireTranslations( translationPayback, translationApp );
                    }],
                    '':['$ocLazyLoad', function ($ocLazyLoad){
                        return 	$ocLazyLoad.load([
                                {
                                    name:'dependencies',
                                    files:[
                                        'modules/spha/js/services/propertiesServiceSpha.js',
                                        'modules/spha/js/services/shareDataServices.js',
                                        'modules/spha/js/services/sphaUtilsServices.js',
                                        'modules/spha/js/services/uploadFilesServicesSpha.js',
                                        'modules/spha/js/services/sphaCompanyServices.js',
                                        'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                        'modules/spha/js/services/sphaProcedureServices.js',
                                        'modules/spha/js/services/sphaPossibleValueServices.js',
                                        'modules/spha/js/services/sphaRipianoSpesaServices.js',
                                        'modules/spha/js/directives/dynamicFilters/sphaDynamicFilters.js',
                                        'modules/spha/js/directives/tablePayback/sphaTablePayback.js',
                                    ],
                                    serie: true,
                                },
                                {
                                    name:'controller',
                                    files:[
                                        'modules/spha/js/controllers/abstractControllers/sphaRipianoSecondPhaseProcedureController.js',
                                        'modules/spha/js/controllers/ripianoFase2/sphaRipianoSpesaCtrl.js',
                                    ],
                                    serie: true,
                                }
                            ]
                        );
                    }]
                }
            }).state('spha.sphaProcedureStatistiche', {
                url: '/procedimenti/statistiche',
                ncyBreadcrumb: {
                    label: '{{"PROCEDIMENTI_STATISTICHE" | translate}}',
                    parent: 'spha.home'
                },
                params: {},
                views: {
                    'content': {
                        templateUrl: './modules/spha/html/statistiche/sphaStatisticheProcedimenti.html',
                        controller: 'sphaStatisticheProcedimentiCtrl',
                        controllerAs: 'ctrl'
                    },
                    'menu': {
                        templateUrl: './modules/menu/html/menu.html',
                        controller: 'menuCtrl'
                    }
                },
                resolve: {
                    translate: ['RequireTranslations', function(RequireTranslations) {
                        RequireTranslations(translationCommon, translationApp);
                        RequireTranslations(translationProcedimenti, translationApp);
                        RequireTranslations(translationStatistiche, translationApp);
                        RequireTranslations(translationProcedimenti + "/" + proceduresTypes, translationApp);
                    }],
                    '': ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load([{
                                name: 'dependencies',
                                files: [
                                    'modules/spha/js/services/propertiesServiceSpha.js',
                                    'modules/spha/js/services/shareDataServices.js',
                                    'modules/spha/js/services/sphaProcedureServices.js',
                                    'modules/spha/js/services/sphaProcedureInstanceServices.js',
                                    'modules/spha/js/services/uploadFilesServicesSpha.js',
                                    'modules/spha/js/directives/edit_history/editHistory.js',
                                    'modules/spha/js/directives/state_history/stateHistory.js',
                                    'modules/spha/js/directives/objections_history/objectionsHistory.js',
                                    'modules/spha/js/directives/history_delegation/historyDelegation.js',
                                    'modules/spha/js/directives/tableOperations/tableOperations.js',
                                    'modules/spha/js/services/sphaCompanyServices.js',

                                ],
                                serie: true,
                            },
                            {
                                name: 'controller',
                                files: [
                                    'modules/spha/js/controllers/statistiche/sphaStatisticheProcedimentiCtrl.js',
                                ],
                                serie: true,
                            }
                        ]);
                    }]
                }
            });

    	}

})();
