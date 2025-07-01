(function () {
    'use strict';
    angular.module('sphaApp')
        .factory('sphaUtilsServices', sphaUtilsServices);

    function sphaUtilsServices() {
        var services = {};
        
        /**
         * Function for fields that has been previously modified inside a section
         *
         * @param idField
         * @param data
         */
        function fieldHasBeenModified(idField, data) {
            if (data && data[idField] && data[idField].edited === true) {
                $('#' + idField).closest('.col-xs-12').addClass('hasBeenModified');
                return true;
            } else {
                $('#' + idField).closest('.col-xs-12').removeClass('hasBeenModified');
            }
            return false;
        }

        /**
         * 
         * @param idField
         * @param data
         * @param form
         */
        function fieldHasBeenRectified(idField, data, form) {
            if (form) {
                if ((data && data[idField] && data[idField].rectified === true) ||
                    (form && form[idField] && form[idField].$dirty && data && data[idField] &&
                        !valueEquals(data[idField].oldValue, data[idField].value, data[idField].fieldType))) {
                    $('#' + idField).closest('.col-xs-12').addClass('hasBeenRectified');
                    return true;
                } else {
                    $('#' + idField).closest('.col-xs-12').removeClass('hasBeenRectified');
                    form[idField].$setDirty(false);
                }
            }
            return false;
        }
        
        function valueEquals(oldValue, newValue, fieldType) {
            if(oldValue === newValue) {
                return true;
            }
            var newValueToChek = normalizeValue(newValue, fieldType);
            var oldValueToChek = normalizeValue(oldValue, fieldType);
            
            if(newValueToChek && oldValueToChek) {
                switch (fieldType) {
                    case 'DATE':
                        newValueToChek = newValueToChek.toLocaleDateString();
                        oldValueToChek = oldValueToChek.toLocaleDateString();
                }
            }
            return (!newValueToChek && !newValueToChek) || angular.equals(newValueToChek, oldValueToChek);
        }
        
        function normalizeValue(value, type) {
            if(value === '' || value === null) {
                return undefined;
            }
            return services.castToClientValue(value, type);
        }
        
        services.castToClientValue = function (fieldValue, fieldType){
            if(fieldValue) {
                switch (fieldType) {
                    case 'DATE':
                        return services.serverToClientDate(fieldValue);
                }
            }
            return fieldValue;
        };
        
        services.castToServerValue = function (fieldValue, fieldType){
            if(fieldValue) {
                switch (fieldType) {
                    case 'DATE':
                        return services.clientToServerDate(fieldValue);
                }
            }
            return fieldValue;
        };


        /**
         *
         * @param data data
         * @param filters filters
         */
        services.mapSearchFilterResponse = function (data, filters) {
            data.forEach(meta => {
                if (meta && meta.name && filters[meta.name]) {
                    filters[meta.name].elements = filters[meta.name].elements ? filters[meta.name].elements.concat(meta.options) : null;
                    if (meta.page) {
                        filters[meta.name].page = meta.page;
                    }
                    if (meta.total) {
                        filters[meta.name].total = meta.total;
                    }
                }
            });
        };

        /**
         *
         * @param filters filters
         * @param filterName filterName
         * @param isArray isArray
         * @returns {null|*}
         */
        services.prefillFilterWithFirstValue = function (filters, filterName, isArray) {
            if (filters && filters[filterName] && filters[filterName].elements && filters[filterName].elements.length > 0) {
                return filters[filterName].elements[0] && filters[filterName].elements[0].value ?
                    isArray ? [filters[filterName].elements[0].value] : filters[filterName].elements[0].value
                    : null;
            }
            return null;
        };

        /**
         * Function for add class to fields in section
         *
         * @param idField
         * @param data
         * @param form
         */
        services.addFieldClass = function (idField, data, form) {
            if (data && data[idField] && form && form[idField] && form[idField].$invalid) {
                return 'has-errors';
            }
            if(!fieldHasBeenRectified(idField, data, form)) {
                fieldHasBeenModified(idField, data);
            }
        };
        
        services.mapAnagraphicHistoryDTOs = function (data, rectificationDetailInfoType) {
            // List<AnagraphicHistoryEntry>
            var keyList = null;
            if( data && data.length > 0) {
                keyList = [];
                data.forEach(e => {
                    var castedKeyValue = services.castToClientValue(e.key.date, 'DATE');
                    e.key.date = castedKeyValue ? castedKeyValue.toLocaleDateString() : null;
                    keyList.push(e.key.date);
                    angular.forEach(e.object, function (value, key) {
                        e.object[key].value = services.castToClientValue(e.object[key].value, e.object[key].fieldType);
                    });
                    if(rectificationDetailInfoType) {
                        e.rectificationDetailInfoType = rectificationDetailInfoType;
                    }
                });
            }
            return keyList;
        };

        /**
         * Converts Date received from Backend
         * to a Date object suitable to be displayed
         * in frontend Date component
         * @param beDate Date in String format received from BE
         */
        services.serverToClientDate = function (beDate) {
            if (beDate) {
                return new Date(beDate);
            }
            return beDate;
        };

        /**
         * Converts Date from Frontend
         * to a String object suitable for the Beckend
         * @param feDate Date in Date format received from FE
         */
        services.clientToServerDate = function (feDate) {
            if(feDate) {
                const isoStringDate = feDate.toISOString();
                return isoStringDate ? isoStringDate.substr(0, 10) : isoStringDate;
            }
            return feDate;
        };

        return services;
    }
})();