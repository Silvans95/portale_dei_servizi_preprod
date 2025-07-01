'use strict';
/**
 * @ngdoc function
 * @name sphaTablePayback
 * @description directive for filter payback
 * # sphaTablePayback
 * Controller of the sbAdminApp
 */
(function () {
    angular.module('sphaApp')
        .directive('sphaTablePayback',
            ['$document', '$compile', '$timeout', 'blockUI', '$cookies', 'sphaUtilsServices', 'sphaCompanyServices',
                'shareDataServices', 'sphaPossibleValueServices',
                'NgTableParams',
                sphaTablePayback]);

    function sphaTablePayback($document, $compile, $timeout, blockUI, $cookies, sphaUtilsServices, sphaCompanyServices,
                               shareDataServices, sphaPossibleValueServices,
                               NgTableParams) {


        return {
            restrict: 'E',
            templateUrl: 'modules/spha/js/directives/tablePayback/sphaTablePayback.html',
            scope: {
                filters: '=filters',
                table: '=table',
                getData: '=getData',
                index: '=index',
                tableName: '=tableName',
                setReloadTableFn: '&'
            },
            link: linkFunc
        };

        function linkFunc(scope, el, attrs) {
            var sortingKeyCookie;
            var sortingValueCookie;
            var initialSortingKey = sortingKeyCookie && $cookies.get(sortingKeyCookie) ? $cookies.get(sortingKeyCookie) : 'id';
            var initialSortingDirection = sortingValueCookie && $cookies.get(sortingValueCookie) ? $cookies.get(sortingValueCookie) : 'desc';
            
            /**
             * Inizializzazione NGTable
             */
            function initTable() {
                scope.dynamicTable = new NgTableParams({
                    page: 1,
                    count: scope.tableName === 'regione' ? 25 : 10,
                    sorting: scope.table.sortable ? {
                        [initialSortingKey]: initialSortingDirection.toLowerCase(),
                    }: undefined,
                    cleanTable: false
                }, {
                    enableRowSelection: true,
                    //number of element option to visualize for page
                    counts: scope.table.sortable && scope.tableName !== 'regione' ? [5, 10, 25, 50] : undefined,
                    //get data : server side processing
                    getData: function (params) {
                        //for filtering data
                        var filter = scope.filters();
                        //count of element
                        var count = params.count();
                        //page
                        var page = params.page();
                        //sorting
                        var sorting = params.sorting();
                        var sortingKey = sorting ? Object.keys(sorting)[0] : null;
                        var sortingValue = sortingKey && sorting? sorting[sortingKey] : null;
                        var order = [{
                            'property': sortingKey ? sortingKey : '',
                            'direction': sortingValue ? sortingValue.toUpperCase() : null,
                        }
                        ];
                        //enable loading spinner
                        scope.isLoading = true;
                        //object for api rest
                        var obj = {
                            start: (page - 1) * count,
                            length: count,
                            search: '',
                            filters: filter,
                        };
                        if (sortingKey) {
                            obj.order = order;
                            $cookies.put(sortingKeyCookie, order[0].property);
                            $cookies.put(sortingValueCookie, order[0].direction);
                        }

                        //rendering data
                        return scope.getData(obj, scope.table).then(function (result) {
                            if(result && result.total) {
                                params.total(result.total);
                            }
                            scope.footer = result && result.footer;
                            scope.isLoading = false;
                            return result && result.data;
                        });
                    }
                });
            }
            
            function reloadTable() {
                scope.dynamicTable.page(1);
                scope.dynamicTable.reload();
            }
            
            function init() {
                initTable();
                scope.table.reload = reloadTable;
            }

            init();
        }
    }
})();