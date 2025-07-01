
(function () { 
    'use strict';
	angular.module('sphaApp')
	    .factory( 'sphaRipianoSpesaServices', sphaRipianoSpesaServices)
        .$inject = ['$translate', '$log', '$http', '$cookies', 'httpServices','PropertiesServiceSpha'];
	
    function sphaRipianoSpesaServices($translate, $log, $http, $cookies, $q, httpServices, PropertiesServiceSpha) {
        const procedimentiMsBaseUrl = PropertiesServiceSpha.get('baseUrlProcedure');
        
        const services = {
            ripianoSpesaAnnoUrl: procedimentiMsBaseUrl + 'api/ripiano-spesa-anno-sas/spesa/',
            ripianoSpesaAnnoReportUrl: procedimentiMsBaseUrl + 'api/ripiano-spesa-anno-sas/report/',
            
            ripianoPaybackADUrl: procedimentiMsBaseUrl + 'api/ripiano-payback-ad-sas/spesa/',
            ripianoPaybackADReportUrl: procedimentiMsBaseUrl + 'api/ripiano-payback-ad-sas/report/',
            
            ripianoQuoteADUrl: procedimentiMsBaseUrl + 'api/ripiano-quote-ad-sas/spesa/',
            ripianoQuoteADReportUrl: procedimentiMsBaseUrl + 'api/ripiano-quote-ad-sas/report/',
            ripianoQuoteADFieldsToNotShowUrl: procedimentiMsBaseUrl + 'api/ripiano-quote-ad-sas/fields-to-not-show/',
            
            ripianoAziendaUrl: procedimentiMsBaseUrl + 'api/ripiano-azienda-sas/spesa/',
            ripianoAziendaReportUrl: procedimentiMsBaseUrl + 'api/ripiano-azienda-sas/report/',
            
            // exportCsvUrl: procedimentiMsBaseUrl +'api/medicines/export',
        };

        const spesaAnnoTables = {
            allFields: {
                sortable: true,
                headerToObject: true,
                header: [
                    'codiceSis', 'titolareSis', 'valoreTraccia'
                ]
            }
        };

        const spesaAnnoTablesMenu2 = {
            allFieldsMenu2: {
                sortable: true,
                headerToObject: true,
                header: [
                    'codiceSis', 'titolareSis', 'valoreTraccia'
                ]
            }
        };

        const spesaAnnoTablesMenu3 = {
            allFieldsMenu3: {
                sortable: true,
                headerToObject: true,
                header: [
                    'codiceSis', 'titolareSis', 'valoreTraccia'
                ]
            }
        };

        const spesaAnnoTablesMenu4 = {
            allFieldsMenu4: {
                sortable: true,
                headerToObject: true,
                header: [
                    'codiceSis', 'titolareSis', 'valoreTraccia'
                ]
            }
        };
        
        const quoteAdTables = {
            allFields: {
                sortable: true,
                headerToObject: true,
                header: ['codiceSis', 'titolareSis', 'spesa', 'importoPB', 'franchigia', 'spesaNettoPB', 
                    'spesaNettoPBeFranchigia', 'spesaPerQuotaMercato', 'totaleMercato', 'quotaMercato', 'sfondamento',
                    'ripiano',  'valTracciaNonInnoJ07'
                ]
            }
        };

        const quoteAdTablesMenu6 = {
            allFieldsMenu6: {
                sortable: true,
                headerToObject: true,
                header: ['codiceSis', 'titolareSis', 'to', 'no', 'si', 'valTracciaNonInnoJ07', 'spesa', 'importoPB', 'spesaNettoPB', 'franchigia', 
                    'spesaNettoPBeFranchigia', 'spesaPerQuotaMercato', 'totaleMercato', 'quotaMercato', 'sfondamento', 'ripiano', 'importoRipianoDMTetti'
                ]
            }
        };

        const quoteAdTablesMenu7 = {
            allFieldsMenu7: {
                sortable: true,
                headerToObject: true,
                header: ['codiceSis', 'titolareSis', 'spesa', 'importoPB', 'spesaNettoPB', 'franchigia',
                    'spesaNettoPBeFranchigia', 'spesaPerQuotaMercato', 'totaleMercato', 'quotaMercato', 'sfondamento', 'ripiano'
                ]
            }
        };

        const quoteAdTablesMenu8 = {
            allFieldsMenu8: {
                sortable: true,
                headerToObject: true,
                header: ['codiceSis', 'titolareSis', 'spesa', 'importoPB', 'spesaNettoPB', 'franchigia',
                    'spesaNettoPBeFranchigia', 'spesaPerQuotaMercato', 'totaleMercato', 'quotaMercato', 'sfondamento', 'ripiano'
                ]
            }
        };

        
        const ripianoSpesaAnnoQuery = {
            NSIS_TR_A_H_EXCLUSIVE: { 
                reportUrl: services.ripianoSpesaAnnoReportUrl + 'SHELF_NSIS_TR_A_H_EXCLUSIVE',
                url: services.ripianoSpesaAnnoUrl + 'NSIS_TR_A_H_EXCLUSIVE',
                tables: spesaAnnoTablesMenu2
            },
            NSIS_TR_A_H_V03AN: { 
                reportUrl: services.ripianoSpesaAnnoReportUrl + 'SHELF_NSIS_TR_A_H_V03AN',
                url: services.ripianoSpesaAnnoUrl + 'NSIS_TR_A_H_V03AN',
                tables: spesaAnnoTablesMenu3
            },
            NSIS_TR_A_H_INN_ONC: { 
                reportUrl: services.ripianoSpesaAnnoReportUrl + 'SHELF_NSIS_TR_A_H_INN_ONC',
                url: services.ripianoSpesaAnnoUrl + 'NSIS_TR_A_H_INN_ONC',
                tables: spesaAnnoTablesMenu4
            },
            NSIS_TR_A_H_INN_NON_ONC: { 
                reportUrl: services.ripianoSpesaAnnoReportUrl + 'SHELF_NSIS_TR_A_H_INN_NON_ONC',
                url: services.ripianoSpesaAnnoUrl + 'NSIS_TR_A_H_INN_NON_ONC',
                tables: spesaAnnoTables
            },
            PAYBACK_AMOUNT_DIRECT_PURCHASES: {
                reportUrl: services.ripianoPaybackADReportUrl + 'SHELF_PAYBACK_AMOUNT_DIRECT_PURCHASES',
                url: services.ripianoPaybackADUrl + 'PAYBACK_AMOUNT_DIRECT_PURCHASES',
                tables: {
                    allFields: {
                        sortable: true,
                        headerToObject: true,
                        header: [
                            'codiceSis', 'titolareSis', 'gasMedicinali', 'nomeSpecialita', 'aic6', 'atc', 
                             'innovativoOncChar', 'pctInnoTettiAccordiPV', 'pctInnovativiMEA', 
                            'pb5ClasseANonInnov', 'pb5ClasseAInnov', 'pb5ClasseHNonInnov', 'pb5ClasseHInnov',
                            'pbManovraNonInnov', 'pbManovraInnov', 'valoriNCNonInnov', 'valoriNCInnov',
                            'importoPBMeaNonInno', 'importoPBMeaInno', 'pbTettiAccordiPVNonInno',
                            'pbTettiAccordiPVInno', 'pbDirNonInno', 'pbDirInno'
                        ]
                    }
                }
            },
            MARKET_SHARES_EXCLUSIVE: {
                fieldsToNotShowUrl: services.ripianoQuoteADFieldsToNotShowUrl + 'MARKET_SHARES_EXCLUSIVE',
                reportUrl: services.ripianoQuoteADReportUrl + 'SHELF_MARKET_SHARES_EXCLUSIVE',
                url: services.ripianoQuoteADUrl + 'MARKET_SHARES_EXCLUSIVE',
                tables: quoteAdTablesMenu6
            },
            MARKET_SHARES_MEDICINE_GAS: {
                fieldsToNotShowUrl: services.ripianoQuoteADFieldsToNotShowUrl + 'MARKET_SHARES_MEDICINE_GAS',
                reportUrl: services.ripianoQuoteADReportUrl + 'SHELF_MARKET_SHARES_MEDICINE_GAS',
                url: services.ripianoQuoteADUrl + 'MARKET_SHARES_MEDICINE_GAS',
                tables: quoteAdTablesMenu7
            },
            MARKET_SHARES_INN_ONC: {
                fieldsToNotShowUrl: services.ripianoQuoteADFieldsToNotShowUrl + 'MARKET_SHARES_INN_ONC',
                reportUrl: services.ripianoQuoteADReportUrl + 'SHELF_MARKET_SHARES_INN_ONC',
                url: services.ripianoQuoteADUrl + 'MARKET_SHARES_INN_ONC',
                tables: quoteAdTablesMenu8
            },
            MARKET_SHARES_INN_NON_ONC: {
                fieldsToNotShowUrl: services.ripianoQuoteADFieldsToNotShowUrl + 'MARKET_SHARES_INN_NON_ONC',
                reportUrl: services.ripianoQuoteADReportUrl + 'SHELF_MARKET_SHARES_INN_NON_ONC',
                url: services.ripianoQuoteADUrl + 'MARKET_SHARES_INN_NON_ONC',
                tables: quoteAdTables
            },
            SHELF_TOT_SIS: {
                reportUrl: services.ripianoAziendaReportUrl + 'SHELF_TOT_SIS',
                url: services.ripianoAziendaUrl + 'SHELF_TOT_SIS',
                tables: {
                    allFields: {
                        sortable: true,
                        headerToObject: true,
                        header: [
                            'codiceSis', 'titolareSis', 'importoRipianoNoV03AN', 'importoRipianoNoV03ANDMTetti', 'importoRipianoV03AN', 'importoRipianoInnovOnc',
                             'ripianoTotale', 'ripianoTotaleTetto8'
                        ]
                    }
                }
            }
        };
        
        services.paymentType = {
            SHELF: {
                query: ripianoSpesaAnnoQuery
            }
        };
        
        function buildHeader(translationPrefix, sortable, headerNames) {
            let header = [];
            for (let name of headerNames) {
                var title = $translate.instant(translationPrefix + '.' + name);
                var isCurrency = title && title.indexOf('\u20AC') !== -1;
                if(sortable === true) {
                    header.push({field: name, title: title, show: true, sortable: name, isCurrency: isCurrency});
                } else {
                    header.push({field: name, title: title, show: true, isCurrency: isCurrency});
                }
            }
            return header;
        }
        
        
        /**
         * handle response from server
         * @param data
         * @param success
         * @param error
         * @param callback
         */
        function handleResponse(data, success, error, callback) {
            var errors = {};
            if (success) {
                if (error) {
                    errors.message = error.message ? error.message : error;
                    errors.alertClass = 'alert alert-warning';
                }
            } else {
                errors.message = error && error.message ? error.message : error;
                errors.alertClass = 'alert alert-danger';
            }
            callback(data,errors);
        }


        function updateCookie(cookieName, cookieValue) {
            if (cookieValue) {
                $cookies.put(cookieName, cookieValue);
            } else {
                $cookies.remove(cookieName);
            }
        }
        
        function buildUrlRipiano(queryType, procedureDTO, table) {
            var tableUrl = table && table.url;
            if(tableUrl) {
                return tableUrl;
            }
            return services.paymentType[procedureDTO.type] && services.paymentType[procedureDTO.type].query[queryType].url;
        }
        
        function buildUrlRipianoFindFieldsToNotShow(queryType, procedureDTO) {
            return services.paymentType[procedureDTO.type] && services.paymentType[procedureDTO.type].query[queryType].fieldsToNotShowUrl;
        }
        
        function getTableConfig(queryType, procedureDTO, fieldsToNotShow) {
            var tables = angular.copy(services.paymentType[procedureDTO.type] && services.paymentType[procedureDTO.type].query[queryType].tables);
            var headerNames = [];
           
            for (var table in tables) {
                if (tables.hasOwnProperty(table) && tables[table].headerToObject) {
                    headerNames = tables[table].header
                        .filter(headerName => !(fieldsToNotShow && fieldsToNotShow.length > 0 && fieldsToNotShow.indexOf(headerName) >= 0));
                    tables[table].header = buildHeader(procedureDTO.type + '.' + table, tables[table].sortable, headerNames);
                }
            }
            return tables;
        }
        
        services.getExportReportUrl = function (queryType, procedureDTO) {
            return services.paymentType[procedureDTO.type] && services.paymentType[procedureDTO.type].query[queryType].reportUrl;
        };
        
        services.getTableConfig = function(queryType, procedureDTO, callback) {
            if(buildUrlRipianoFindFieldsToNotShow(queryType, procedureDTO)) {
                services.findFieldsToNotShow(queryType, procedureDTO, function (data, error) {
                    if(error && error.message) {
                        callback(null, error);
                    } else {
                        callback(getTableConfig(queryType, procedureDTO, data), error);
                    }
                });
            } else {
                callback(getTableConfig(queryType, procedureDTO, null), null);
            }
        };
        
        /**
         * get dati riepilogativi from payment
         * @param criteria
         * @param queryType
         * @param procedureDTO
         * @param callback
         */
        services.getRipianoSpesa = function(criteria, queryType, procedureDTO, table, callback) {
            var url = buildUrlRipiano(queryType, procedureDTO, table);
            httpServices.post(url, criteria, function (data, success, error) {
                handleResponse(data, success, error, callback);
            });
        };

        /**
         * 
         * @param filters filters
         * @param prefix prefix
         */
        services.updateFiltersCookies = function(filters, prefix) {
            switch (prefix) {
                case 'SHELF_NSIS_TR_A_H_EXCLUSIVE':
                case 'SHELF_NSIS_TR_A_H_V03AN':
                case 'SHELF_NSIS_TR_A_H_INN_ONC':
                case 'SHELF_NSIS_TR_A_H_INN_NON_ONC':
                case 'SHELF_PAYBACK_AMOUNT_DIRECT_PURCHASES':
                case 'SHELF_MARKET_SHARES_EXCLUSIVE':
                case 'SHELF_MARKET_SHARES_MEDICINE_GAS':
                case 'SHELF_MARKET_SHARES_INN_ONC':
                case 'SHELF_MARKET_SHARES_INN_NON_ONC':
                case 'SHELF_TOT_SIS':
                    for(let filt in filters) {
                        if(filters.hasOwnProperty(filt)) {
                            updateCookie(prefix + filt, filters[filt] ? JSON.stringify(filters[filt]) : null);
                        }
                    }
                    break;
            }
        };
        

        /**
         * update filter cookie
         * @param filters
         * @param prefix
         * @param lockedMode
         */
        services.getFiltersFromCookies = function(filters, prefix, lockedMode) {
            switch (prefix) {
                case 'SHELF_NSIS_TR_A_H_EXCLUSIVE':
                case 'SHELF_NSIS_TR_A_H_V03AN':
                case 'SHELF_NSIS_TR_A_H_INN_ONC':
                case 'SHELF_NSIS_TR_A_H_INN_NON_ONC':
                case 'SHELF_MARKET_SHARES_EXCLUSIVE':
                case 'SHELF_MARKET_SHARES_MEDICINE_GAS':
                case 'SHELF_MARKET_SHARES_INN_ONC':
                case 'SHELF_MARKET_SHARES_INN_NON_ONC':
                case 'SHELF_TOT_SIS':
                    filters.codiceSis = !lockedMode && $cookies.get(prefix + 'codiceSis') ? JSON.parse($cookies.get(prefix + 'codiceSis')).in : filters.codiceSis;
                    break;
                case 'SHELF_PAYBACK_AMOUNT_DIRECT_PURCHASES':
                    filters.codiceSis = !lockedMode && $cookies.get(prefix + 'codiceSis')? JSON.parse($cookies.get(prefix + 'codiceSis')).in : filters.codiceSis;
                    filters.gasMedicinali = $cookies.get(prefix + 'gasMedicinali') ? JSON.parse($cookies.get(prefix + 'gasMedicinali')).equals : filters.gasMedicinali;
                    filters.nomeSpecialita = $cookies.get(prefix + 'nomeSpecialita') ? JSON.parse($cookies.get(prefix + 'nomeSpecialita')).contains : filters.nomeSpecialita;
                    filters.aic6 = $cookies.get(prefix + 'aic6') ? JSON.parse($cookies.get(prefix + 'aic6')).contains : filters.aic6;
                    filters.atc = $cookies.get(prefix + 'atc') ? JSON.parse($cookies.get(prefix + 'atc')).in : filters.atc;
                    filters.innovative = $cookies.get(prefix + 'innovative') ? JSON.parse($cookies.get(prefix + 'innovative')).equals : filters.innovative;
                    break;
            }
            
        };

        services.buildAccordions = function (prefix, controller) {
            const baseFiltersTemplatePath = 'modules/spha/js/directives/dynamicFilters/';
            switch (prefix) {
                case 'SHELF_NSIS_TR_A_H_EXCLUSIVE':
                case 'SHELF_NSIS_TR_A_H_V03AN':
                case 'SHELF_NSIS_TR_A_H_INN_ONC':
                case 'SHELF_NSIS_TR_A_H_INN_NON_ONC':
                case 'SHELF_MARKET_SHARES_EXCLUSIVE':
                case 'SHELF_MARKET_SHARES_MEDICINE_GAS':
                case 'SHELF_MARKET_SHARES_INN_ONC':
                case 'SHELF_MARKET_SHARES_INN_NON_ONC':
                case 'SHELF_SHELF_TOT_SIS':
                    return {
                        accordion1: {
                            id: 'accordion1',
                            open: true,
                            show: true,
                            template: baseFiltersTemplatePath + 'dynamicAccordion/accordion.html',
                            filters: {
                                row1: {
                                    codiceSis: {
                                        class: 'col-xs-12 col-sm-12 col-md-6 col-lg-6',
                                        type: 'multiselect_companies',
                                        ngModelName: 'codiceSis',
                                        code: 'COMPANIES',
                                        required: controller.lockedMode
                                    }
                                }
                            }
                        }
                    };
                case 'SHELF_PAYBACK_AMOUNT_DIRECT_PURCHASES':
                    return {
                        accordion1: {
                            id: 'accordion1',
                            open: true,
                            show: true,
                            template: baseFiltersTemplatePath + 'dynamicAccordion/accordion.html',
                            filters: {
                                row1: {
                                    codiceSis: {
                                        class: 'col-xs-12 col-sm-12 col-md-6 col-lg-6',
                                        type: 'multiselect_companies',
                                        ngModelName: 'codiceSis',
                                        code: 'COMPANIES',
                                        required: controller.lockedMode
                                    },
                                    gasMedicinali: {
                                        type: 'simple_select', ngModelName: 'gasMedicinali', code: 'GAS_MEDICINALI',
                                        options: [{value: true, label: 'YES'}, {value: false, label: 'NO'}]
                                    }
                                },
                                row2: {
                                    nomeSpecialita: {
                                        type: 'text',
                                        ngModelName: 'nomeSpecialita',
                                        code: 'NOME_SPECIALITA'
                                    },
                                    aic6: {type: 'text', ngModelName: 'aic6', code: 'AIC6'},
                                    atc: {type: 'multiselect_atc', ngModelName: 'atc', code: 'ATC'},
                                    innovative: {
                                        type: 'simple_select', ngModelName: 'innovative', code: 'INNOVATIVE',
                                        options: [{value: true, label: 'YES'}, {value: false, label: 'NO'}]
                                    }
                                }
                            }
                        }
                    };
            }
            return null;
        };

        services.buildFilters = function (prefix, controller) {
            switch (prefix) {
                case 'SHELF_NSIS_TR_A_H_EXCLUSIVE':
                case 'SHELF_NSIS_TR_A_H_V03AN':
                case 'SHELF_NSIS_TR_A_H_INN_ONC':
                case 'SHELF_NSIS_TR_A_H_INN_NON_ONC':
                case 'SHELF_MARKET_SHARES_EXCLUSIVE':
                case 'SHELF_MARKET_SHARES_MEDICINE_GAS':
                case 'SHELF_MARKET_SHARES_INN_ONC':
                case 'SHELF_MARKET_SHARES_INN_NON_ONC':
                case 'SHELF_SHELF_TOT_SIS':
                    return {
                        procedureId: {equals: controller.procedureDTO.id},
                        codiceSis: controller.filtersDirective.codiceSis && controller.filtersDirective.codiceSis.length > 0 ? {in: controller.filtersDirective.codiceSis} : undefined,
                    };
                case 'SHELF_PAYBACK_AMOUNT_DIRECT_PURCHASES':
                    return {
                        procedureId: {equals: controller.procedureDTO.id},
                        codiceSis: controller.filtersDirective.codiceSis && controller.filtersDirective.codiceSis.length > 0 ? {in: controller.filtersDirective.codiceSis} : undefined,
                        gasMedicinali: controller.filtersDirective.gasMedicinali ? {equals: controller.filtersDirective.gasMedicinali === true} : undefined,
                        nomeSpecialita: controller.filtersDirective.nomeSpecialita ? {contains: controller.filtersDirective.nomeSpecialita} : undefined,
                        aic6: controller.filtersDirective.aic6 ? {contains: controller.filtersDirective.aic6} : undefined,
                        atc: controller.filtersDirective.atc && controller.filtersDirective.atc.length > 0 ? {in: controller.filtersDirective.atc} : undefined,
                        innovative: controller.filtersDirective.innovative ? {equals: controller.filtersDirective.innovative} : undefined
                    };
            }
            return null;
        };
        
        services.findFieldsToNotShow = function(queryType, procedureDTO, callback) {
            var url = buildUrlRipianoFindFieldsToNotShow(queryType, procedureDTO);
            if(url) {
                httpServices.get(url, function (data, success, error) {
                    handleResponse(data, success, error, callback);
                });
            }
        };

        return services;
	}
})();
