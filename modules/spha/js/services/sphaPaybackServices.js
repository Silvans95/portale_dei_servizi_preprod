
(function () {
    'use strict';
    angular.module('sphaApp')
        .factory('sphaPaybackServices', sphaPaybackServices)
        .$inject = ['$translate', '$log', '$http', '$cookies', 'httpServices', 'PropertiesServiceSpha'];

    function sphaPaybackServices($translate, $log, $http, $cookies, httpServices, PropertiesServiceSpha) {
        const procedimentiMsBaseUrl = PropertiesServiceSpha.get('baseUrlProcedure');
        const moduloAccettazioneUrl = PropertiesServiceSpha.get('baseUrlProcedure') + 'api/modulo-accettaziones';
        
  		const apiAnagraficheUrl = PropertiesServiceSpha.get('baseUrlAnagraphic') ;
         

        const protocolFileUrl = moduloAccettazioneUrl +  '/protocol';
        const moduloAccettazioneListUrl = moduloAccettazioneUrl +  '/list';
        const submitAccettazioneUrl = moduloAccettazioneUrl + '/submit-acceptance';
        const acceptanceFileUrl = PropertiesServiceSpha.get('baseUrlProcedure') + 'api/modulo-accettazione-files';
        const acceptanceFileAllUrl = acceptanceFileUrl + '/all';
        const acceptancePdfBuildUrl = moduloAccettazioneUrl + '/build-pdf';

        const services = {
            datiRiepilogativi183Url: procedimentiMsBaseUrl + 'api/payback-183-sas/dati-riepilogativi/',
            datiRiepilogativi5Url: procedimentiMsBaseUrl + 'api/payback-5-sas/dati-riepilogativi/',
            payback183SpesaUrl: procedimentiMsBaseUrl + 'api/payback-183-sas/spesa/',
            payback183ReportUrl: procedimentiMsBaseUrl + 'api/payback-183-sas/report/',
            payback183QCSpesaUrl: procedimentiMsBaseUrl + 'api/payback-183-qc-sas/spesa/',
            payback183QCReportUrl: procedimentiMsBaseUrl + 'api/payback-183-qc-sas/report/',
            payback5SpesaUrl: procedimentiMsBaseUrl + 'api/payback-5-sas/spesa/',
            payback5ReportUrl: procedimentiMsBaseUrl + 'api/payback-5-sas/report/',
            payback5QCSpesaUrl: procedimentiMsBaseUrl + 'api/payback-5-qc-sas/spesa/',
            payback5QCReportUrl: procedimentiMsBaseUrl + 'api/payback-5-qc-sas/report/',

            ripianoSpesaMeseUrl: procedimentiMsBaseUrl + 'api/ripiano-spesa-mese-sas/spesa/',
            ripianoSpesaMeseReportUrl: procedimentiMsBaseUrl + 'api/ripiano-spesa-mese-sas/report/',
            ripianoSpesaMeseReportAllUrl: procedimentiMsBaseUrl + 'api/ripiano-spesa-mese-sas/reportAll',
            ripianoReportAllFileUrl: procedimentiMsBaseUrl + 'api/ripiano/exportAll'

            
            // exportCsvUrl: procedimentiMsBaseUrl +'api/medicines/export',
        };

        const pb183TotalTable = {
            url: services.payback183SpesaUrl + 'TOTALS',
            sortable: false,
            headerToObject: true,
            header: ['spesaLorda', 'spesaLordaNettoIVA', 'spesaLordaNettoIVAPB5', 'paybackConvenzionata'],
            colspan: {
                spanValue: 'Totali'
            }
        };

        const pb5TotalTable = {
            url: services.payback5SpesaUrl + 'TOTALS',
            sortable: false,
            headerToObject: true,
            header: ['convClasseADiniego', 'convClasseAAccettazione', 'nonConClasseADiniego', 'nonConvClasseAAccettazione',
                'nonConvClasseHDiniego', 'nonConvClasseHAccettazione', 'totaleImportoDiniego', 'totaleImportAccettazione'
            ],
            colspan: {
                spanValue: 'Totali'
            }
        };

        const ripianoSpesaMeseQuery = {
            NSIS_TR_A_H: {
                reportUrl: services.ripianoSpesaMeseReportUrl + 'SHELF_NSIS_TR_A_H',
                tables: {
                    allFields: {
                        url: services.ripianoSpesaMeseUrl + 'NSIS_TR_A_H',
                        sortable: true,
                        headerToObject: true,
                        header: [
                            'codiceSis',  'titolareSis', 'classe', 'atc', 'orfano', 'innovativo', 'inizioInnovativita', 'fineInnovativita', 'aic', 'specialita', 'mese', 'valoriTraccia',  'valoriTracciaNonInnovativi', 'valoriTracciaInnovativi'
                        ]
                    }
                }
            }
        };

        const pb183Query = {
            DATI_RIEPILOGATIVI: {
                reportUrl: services.payback183ReportUrl + 'PB183_DATI_RIEPILOGATIVI',
                url: services.datiRiepilogativi183Url,
                tables: {
                    summary: {
                        isPivot: true,
                        header: ['SUMMARY_DATA_LABEL', 'TOTAL'],
                        class: 'col-xs-12 col-sm-4 col-md-4 col-lg-4'
                    },
                    spesa: {
                        isPivot: true,
                        header: ['CAPITOLI_SPESA', 'VALUE'],
                        valueIsCurrency: true,
                        class: 'col-xs-12 col-sm-8 col-md-8 col-lg-8'
                    }
                }
            },
            AZIENDA: {
                reportUrl: services.payback183ReportUrl + 'PB183_AZIENDA',
                url: services.payback183SpesaUrl + 'AZIENDA',
                tables: {
                    azienda: {
                        sortable: true,
                        headerToObject: true,
                        header: [
                            'codiceSis', 'nomeTitolare',
                            'spesaLorda', 'spesaLordaNettoIVA', 'spesaLordaNettoIVAPB5', 'paybackConvenzionata'],
                        footer: pb183TotalTable,
                    },
                }
            },
            REGIONE: {
                reportUrl: services.payback183ReportUrl + 'PB183_REGIONE',
                url: services.payback183SpesaUrl + 'REGIONE',
                tables: {
                    regione: {
                        sortable: true,
                        headerToObject: true,
                        header: [
                            'region',
                            'spesaLorda', 'spesaLordaNettoIVA', 'spesaLordaNettoIVAPB5', 'paybackConvenzionata'],
                        footer: pb183TotalTable,
                    }
                }
            },
            AIC_9: {
                reportUrl: services.payback183ReportUrl + 'PB183_AIC_9',
                url: services.payback183SpesaUrl + 'AIC_9',
                tables: {
                    aic9: {
                        sortable: true,
                        headerToObject: true,
                        header: [
                            'aic9', 'mese', 'specialita',
                            'spesaLorda', 'spesaLordaNettoIVA', 'spesaLordaNettoIVAPB5', 'paybackConvenzionata'],
                        footer: pb183TotalTable,
                    }
                }
            },
            SPECIALITA: {
                reportUrl: services.payback183ReportUrl + 'PB183_SPECIALITA',
                url: services.payback183SpesaUrl + 'SPECIALITA',
                tables: {
                    specialita: {
                        sortable: true,
                        headerToObject: true,
                        header: [
                            'nomeTitolare', 'aic6', 'mese', 'specialita',
                            'spesaLorda', 'spesaLordaNettoIVA', 'spesaLordaNettoIVAPB5', 'paybackConvenzionata'],
                        footer: pb183TotalTable,
                    }
                }
            },
            CONFEZIONI_EROGATE: {
                reportUrl: services.payback183QCReportUrl + 'PB183_QC_CONFEZIONI_EROGATE',
                url: services.payback183QCSpesaUrl + 'CONFEZIONI_EROGATE',
                tables: {
                    confezioniErogate: {
                        sortable: true,
                        headerToObject: true,
                        header: [
                            'aic9', 'specialita', 'confezione',
                            'pb5', 'numeroConfezioni']
                    }
                }
            },
            // le query sono stata predisposte a BE ma non risultavano presenti questi link da FE
            // AZIENDA_REGIONE: {url: services.payback183SpesaUrl + 'AZIENDA_REGIONE'},
        };

        const pb5Query = {
            DATI_RIEPILOGATIVI: {
                reportUrl: services.payback5ReportUrl + 'PB5_DATI_RIEPILOGATIVI',
                url: services.datiRiepilogativi5Url,
                tables: {
                    summary: {
                        isPivot: true,
                        header: ['SUMMARY_DATA_LABEL', 'TOTAL'],
                        class: 'col-xs-12 col-sm-7 col-md-7 col-lg-7'
                    },
                    spesa: {
                        addAdditionalPaymentFeeHeader: true,
                        headerToObject: true,
                        valueIsCurrency: true,
                        header: [
                            'convClasseA', 'nonConvClasseA', 'nonConvClasseH', 'totale',
                            'numAziendePaganti', 'importoVersato']
                    }
                }
            },
            AZIENDA: {
                reportUrl: services.payback5ReportUrl + 'PB5_AZIENDA',
                url: services.payback5SpesaUrl + 'AZIENDA',
                tables: {
                    azienda: {
                        sortable: true,
                        headerToObject: true,
                        header: [
                            'codiceSis', 'nomeTitolare',
                            'convClasseADiniego', 'convClasseAAccettazione', 'nonConClasseADiniego', 'nonConvClasseAAccettazione',
                            'nonConvClasseHDiniego', 'nonConvClasseHAccettazione', 'totaleImportoDiniego', 'totaleImportAccettazione'],
                        footer: pb5TotalTable
                    }
                }
            },
            REGIONE: {
                reportUrl: services.payback5ReportUrl + 'PB5_REGIONE',
                url: services.payback5SpesaUrl + 'REGIONE',
                tables: {
                    regione: {
                        sortable: true,
                        headerToObject: true,
                        header: [
                            'regionCode', 'region',
                            'convClasseADiniego', 'convClasseAAccettazione', 'nonConClasseADiniego', 'nonConvClasseAAccettazione',
                            'nonConvClasseHDiniego', 'nonConvClasseHAccettazione', 'totaleImportoDiniego', 'totaleImportAccettazione'
                        ],
                        footer: pb5TotalTable
                    }
                }
            },
            REGIONE_MODULO: {
                reportUrl: services.payback5ReportUrl + 'PB5_REGIONE',
                url: services.payback5SpesaUrl + 'REGIONE_MODULO',
                tables: {
                    regione: {
                        sortable: true,
                        headerToObject: true,
                        header: [
                            'regionCode', 'region',
                            'convClasseADiniego', 'convClasseAAccettazione', 'nonConClasseADiniego', 'nonConvClasseAAccettazione',
                            'nonConvClasseHDiniego', 'nonConvClasseHAccettazione', 'totaleImportoDiniego', 'totaleImportAccettazione'
                        ],
                        footer: pb5TotalTable
                    }
                }
            },
            SPECIALITA: {
                reportUrl: services.payback5ReportUrl + 'PB5_SPECIALITA',
                url: services.payback5SpesaUrl + 'SPECIALITA',
                tables: {
                    specialita: {
                        sortable: true,
                        headerToObject: true,
                        header: [
                            'aic6', 'confezione', 'prodotto',
                            'convClasseADiniego', 'convClasseAAccettazione', 'nonConClasseADiniego', 'nonConvClasseAAccettazione',
                            'nonConvClasseHDiniego', 'nonConvClasseHAccettazione', 'totaleImportoDiniego', 'totaleImportAccettazione'
                        ],
                        footer: pb5TotalTable
                    }
                }
            },
            SINGOLO_PRODOTTO: {
                reportUrl: services.payback5ReportUrl + 'PB5_SINGOLO_PRODOTTO',
                url: services.payback5SpesaUrl + 'SINGOLO_PRODOTTO',
                tables: {
                    singoloProdotto: {
                        sortable: true,
                        headerToObject: true,
                        header: [
                            'aic9', 'prodotto', 'principioAttivo', 'confezione', 'classe',
                            'convClasseADiniego', 'convClasseAAccettazione', 'nonConClasseADiniego', 'nonConvClasseAAccettazione',
                            'nonConvClasseHDiniego', 'nonConvClasseHAccettazione', 'totaleImportoDiniego', 'totaleImportAccettazione'
                        ],
                        footer: pb5TotalTable
                    }
                }
            },
            CONFEZIONI_IN_CONVENZIONATA: {
                reportUrl: services.payback5QCReportUrl + 'PB5_QC_CONFEZIONI_IN_CONVENZIONATA',
                url: services.payback5QCSpesaUrl + 'CONFEZIONI_IN_CONVENZIONATA',
                tables: {
                    confezioniConvenzionata: {
                        sortable: true,
                        headerToObject: true,
                        header: [
                            'aic9', 'denominazione', 'principioAttivo', 'confezione',
                            'classe', 'prezzo', 'valore_5perc_ex_factory', 'adesionePBAnnoPrecedente', 'mesiPBProdottoSenzaOpzione',
                            'confezioniMedieDiPeriodo', 'numeroConfezioniAnnoPrecedente'
                        ],
                        headerType: {
                            'valore_5perc_ex_factory': 'currency',
                            'confezioniMedieDiPeriodo': 'decimal',
                        }
                    }
                }
            },
            PB5_AIFA_AIC_9_ACC: {
                reportUrl: services.payback5ReportUrl + 'PB5_AIFA_AIC_9_ACC'
            },
            // le query sono stata predisposte a BE ma non risultavano presenti questi link da FE
            // AIC_6_CONFEZIONE: { url: services.payback5SpesaUrl + 'AIC_6_CONFEZIONE'},
            // AZIENDA_REGIONE: { url: services.payback5SpesaUrl + 'AZIENDA_REGIONE'},
        };

        services.paymentType = {
            PB183: {
                query: pb183Query
            },
            PB5: {
                query: pb5Query
            },
            SHELF: {
                query: ripianoSpesaMeseQuery
            }
        };

        function buildHeader(translationPrefix, sortable, headerNames, override) {
            let header = [];
            for (let name of headerNames) {
                let title = $translate.instant(translationPrefix + '.' + name);
                let isCurrency = title && title.indexOf('\u20AC') !== -1 || (override && override[name] === 'currency');
                let isDecimal = override && override[name] === 'decimal';
                if (sortable === true) {
                    header.push({ field: name, title: title, show: true, sortable: name, isCurrency: isCurrency, isDecimal: isDecimal });
                } else {
                    header.push({ field: name, title: title, show: true, isCurrency: isCurrency, isDecimal: isDecimal });
                }
            }
            return header;
        }

        function buildHeaderColWithIndex(translationPrefix, sortable, name, index, override) {
            let header = null;
            let nameIndex = name.concat(index);
            let title = $translate.instant(translationPrefix + '.' + name, {numRata: index});
            let isCurrency = title && title.indexOf('\u20AC') !== -1 || (override && override[name] === 'currency');
            let isDecimal = override && override[name] === 'decimal';
            if (sortable === true) {
                header = { field: nameIndex, title: title, show: true, sortable: nameIndex, isCurrency: isCurrency, isDecimal: isDecimal };
            } else {
                header = { field: nameIndex, title: title, show: true, isCurrency: isCurrency, isDecimal: isDecimal };
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
            callback(data, errors);
        }


        function updateCookie(cookieName, cookieValue) {
            if (cookieValue) {
                $cookies.put(cookieName, cookieValue);
            } else {
                $cookies.remove(cookieName);
            }
        }

        function buildUrl(queryType, procedureDTO, table) {
            var tableUrl = table && table.url;
            if (tableUrl) {
                return tableUrl;
            }
            return services.paymentType[procedureDTO.type] && services.paymentType[procedureDTO.type].query[queryType].url;
        }

        /**
         * 
         * @param criteria
         * @param page
         * @param pageSize
         * @param unpaged
         * @param order
         * @returns {{start: number, length: (*|number), filters, order: (*|[{id: string}])}}
         */
        function parseRequestCriteria(criteria, start, pageSize, unpaged, order) {
            var pageSizeToUse = null;
            var startToUse = null;
            var unpagedToUse = null;
            if (unpaged === true) {
                unpagedToUse = true;
            } else {
                pageSizeToUse = pageSize ? pageSize : defaultPageSize;
                startToUse = start ? start : 0;
            }
            var orderToUse = order ? order : [{ id: 'asc' }];
            return {
                filters: criteria,
                start: startToUse,
                length: pageSizeToUse,
                unpaged: unpagedToUse,
                order: orderToUse
            };
        }

        services.getExportReportUrl = function (queryType, procedureDTO) {
            return services.paymentType[procedureDTO.type] && services.paymentType[procedureDTO.type].query[queryType].reportUrl;
        };

        services.getExportUrlAll = function(){
            return services.ripianoSpesaMeseReportAllUrl;
        };
        
      	services.getExportUrlAllFile = function(){
            return services.ripianoReportAllFileUrl;
        };

        services.getTableConfig = function (queryType, procedureDTO) {
            var tables = angular.copy(services.paymentType[procedureDTO.type] && services.paymentType[procedureDTO.type].query[queryType].tables);
            var headerNames = [];

            for (var table in tables) {
                if (tables.hasOwnProperty(table) && tables[table].headerToObject) {
                    headerNames = tables[table].header;
                    var header = tables[table].header = buildHeader(procedureDTO.type + '.' + table, tables[table].sortable, headerNames, tables[table].headerType);
                    if (procedureDTO.type === 'PB5' && queryType === 'DATI_RIEPILOGATIVI' && tables[table].addAdditionalPaymentFeeHeader) {
                        for (let i = 0; i < procedureDTO.feeNumber; i++) {
                            header.push(buildHeaderColWithIndex(
                                procedureDTO.type + '.' + table,
                                tables[table].sortable,
                                'numAziendePagantiRata',
                                (i + 1),
                                tables[table].headerType));
                        }
                        for (let i = 0; i < procedureDTO.feeNumber; i++) {
                            header.push(buildHeaderColWithIndex(
                                procedureDTO.type + '.' + table,
                                tables[table].sortable,
                                'importoVersatoRata',
                                (i + 1),
                                tables[table].headerType));
                        }
                    }
                    if (tables[table].footer) {
                        var footerNames = tables[table].footer.header;
                        tables[table].footer.header = buildHeader(
                            procedureDTO.type + '.' + table, tables[table].footer.sortable, footerNames);
                    }
                }
            }
            return tables;
        };

        /**
         * get dati riepilogativi
         * @param criteria
         * @param queryType
         * @param procedureDTO procedure
         * @param callback
         */
        services.getQueryTypeData = function (criteria, queryType, procedureDTO, table, callback) {
            var url = buildUrl(queryType, procedureDTO, table);
            httpServices.post(url, criteria, function (data, success, error) {
                handleResponse(data, success, error, callback);
            });
        };


        services.createModuloAccettazione = function (dto, callback) {
            httpServices.post(moduloAccettazioneUrl, dto, function (data, success, error) {
                handleResponse(data, success, error, callback);
            });
        }

        services.getAcceptanceById = function (id, callback) {
            httpServices.get(moduloAccettazioneUrl + '/' + id, function (data, success, error) {
                handleResponse(data, success, error, callback);
            });
        };

        services.getAcceptancePdfPreview = function (pdfParams, callback) {

            httpServices.arrayBufferResponsePost(acceptancePdfBuildUrl, pdfParams, function (data, success, error) {
                handleResponse(data, success, error, callback);
            });
        };

        services.getAcceptanceFiles = function (criteria, callback) {
            var requestBody = parseRequestCriteria(criteria, null, null, true, null);
            httpServices.post(acceptanceFileAllUrl, requestBody, function (data, success, error) {
                handleResponse(data, success, error, callback);
            });
        };
        
        services.deleteAcceptance = function(idFile, callback) {
            httpServices.delete(moduloAccettazioneUrl + '/' + idFile, function (data, success, error) {
                handleResponse(data, success, error, callback);
            });
        };
        
        services.deleteAllAcceptance = function(idFiles, callback) {
            httpServices.delete(moduloAccettazioneUrl + '?ids=' + idFiles.join(','), function (data, success, error) {
                handleResponse(data, success, error, callback);
            });
        };
        
        services.deleteAcceptanceFile = function(idFile, callback) {
            httpServices.delete(acceptanceFileUrl + '/' + idFile, function (data, success, error) {
                handleResponse(data, success, error, callback);
            });
        };
        
    
        services.updateAcceptance = function (dto, callback) {
            httpServices.put(moduloAccettazioneUrl, dto, function (data, success, error) {
                handleResponse(data, success, error, callback);
            });
        };

        services.signAcceptanceGet = function(signRequest, id, callback) {
            httpServices.post(  moduloAccettazioneUrl  + '/' + id + '/sign-fet-get', signRequest, function(data, success, error) {
                handleResponse(data, success, error, callback);
            });
        };
            
        services.submitAcceptance = function(pdfParams, callback) {
            httpServices.post( submitAccettazioneUrl, pdfParams, function(data, success, error) {
                handleResponse(data, success, error, callback);
            });
        };
        
        services.protocollAcceptanceFile = function(requestProtocolFile, callback) {
            httpServices.post( protocolFileUrl, requestProtocolFile, function(data, success, error) {
                handleResponse(data, success, error, callback);
            });
        };
        
        services.getModuloAccettazionePaged = function(request, procedureId, procedureInstanceId, callback) {
            var url = moduloAccettazioneListUrl + '?';
            if (procedureId) {
                url = url + 'procedureId=' + procedureId;
            }
            if (procedureInstanceId) {
                url = url + '&procedureInstanceId=' + procedureInstanceId;
            }
            httpServices.post(url , request, function (data, success, error) {
                handleResponse(data, success, error, callback);
            });

        }

        /**
         * 
         * @param controller controller
         * @param prefix prefix
         */
        services.updateFiltersCookies = function (controller, prefix) {
            updateCookie(prefix + 'Id', controller.id);
            updateCookie(prefix + 'Companies', controller.companies ? JSON.stringify(controller.companies) : null);
            updateCookie(prefix + 'Description', controller.medicineDescription ? controller.medicineDescription : null);
            updateCookie(prefix + 'Aic', controller.aic ? controller.aic : null);
            updateCookie(prefix + 'BoxDescription', controller.boxDescription ? controller.boxDescription : null);
            updateCookie(prefix + 'ReimbursementClass', controller.reimbursementClass ? JSON.stringify(controller.reimbursementClass) : null);
            updateCookie(prefix + 'Atc', controller.atc ? JSON.stringify(controller.atc) : null);
            updateCookie(prefix + 'Transparency', controller.transparency ? controller.transparency : null);
            updateCookie(prefix + 'Orphan', controller.orphan ? controller.orphan : null);
            updateCookie(prefix + 'Innovative', controller.innovative ? controller.innovative : null);
            updateCookie(prefix + 'Patented', controller.patented ? controller.patented : null);
            updateCookie(prefix + 'ValidMarketingFrom', controller.validMarketingFrom ? controller.validMarketingFrom.toISOString() : null);
            updateCookie(prefix + 'ValidMarketingTo', controller.validMarketingTo ? controller.validMarketingTo.toISOString() : null);
        };


        /**
         * update filter cookie
         * @param filters
         * @param prefix
         * @param lockedMode
         */
        services.getFiltersFromCookies = function (filters, prefix, lockedMode) {
            filters.id = $cookies.get(prefix + 'Id') ? $cookies.get(prefix + 'Id') : filters.id;
            filters.medicineDescription = $cookies.get(prefix + 'Description') ? $cookies.get(prefix + 'Description') : filters.medicineDescription;
            filters.aic = $cookies.get(prefix + 'Aic') ? $cookies.get(prefix + 'Aic') : filters.aic;
            filters.boxDescription = $cookies.get(prefix + 'BoxDescription') ? $cookies.get(prefix + 'BoxDescription') : filters.boxDescription;
            filters.validMarketingFrom = $cookies.get(prefix + 'FirstMarketingFrom') ? new Date($cookies.get(prefix + 'FirstMarketingFrom')) : filters.validMarketingFrom;
            filters.validMarketingTo = $cookies.get(prefix + 'FirstMarketingTo') ? new Date($cookies.get(prefix + 'FirstMarketingTo')) : filters.validMarketingTo;
            filters.transparency = $cookies.get(prefix + 'Transparency') ? $cookies.get(prefix + 'Transparency') === 'true' : filters.transparency;
            filters.orphan = $cookies.get(prefix + 'Orphan') ? $cookies.get(prefix + 'Orphan') === 'true' : filters.orphan;
            filters.innovative = $cookies.get(prefix + 'Innovative') ? $cookies.get(prefix + 'Innovative') === 'true' : filters.innovative;
            filters.patented = $cookies.get(prefix + 'Patented') ? $cookies.get(prefix + 'Patented') === 'true' : filters.patented;
            filters.reimbursementClass = $cookies.get(prefix + 'ReimbursementClass') ? JSON.parse($cookies.get(prefix + 'ReimbursementClass')) : filters.reimbursementClass;
            filters.atc = $cookies.get(prefix + 'Atc') ? JSON.parse($cookies.get(prefix + 'Atc')) : filters.atc;
            filters.companies = !lockedMode && $cookies.get(prefix + 'Companies') ? JSON.parse($cookies.get(prefix + 'Companies')) : filters.companies;
        };

        return services;
    }
})();