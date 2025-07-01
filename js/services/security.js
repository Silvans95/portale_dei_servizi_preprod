(function() {
  
  'use strict';
  
  //USER PROFILE
  angular
      .module('portalApp')
      .factory("AccessManager", accessManager);

      useProfile.$inject = ['$q', 'UserProfile'];  

      function accessManager ($q, UserProfile) {

            var access = {

                  OK : 200,
                  UNAUTHORIZED : 401,

                  //FUNCTION ACCESS MANAGER
                  isAppEnabled : isAppEnabled,
                  hasProfile : hasProfile,
                  hasOneProfile : hasOneProfile,
                  hasAllProfile : hasAllProfile

            };

      return access;

      //////////////////////////////////////

      function isAppEnabled(app) {
            var deferred = $q.defer();
            UserProfile.then(function(userProfile) {
                  if (userProfile.$isAppEnabled(app)) {
                        deferred.resolve(access.OK);
                  } else {
                        deferred.reject(access.UNAUTHORIZED);
                  }
            });
            return deferred.promise;
      };
      
      function hasProfile(profile) {
          var deferred = $q.defer();
          UserProfile.then(function(userProfile) {
                if (userProfile.$hasProfile(profile)) {
                      deferred.resolve(access.OK);
                } else {
                      deferred.reject(access.UNAUTHORIZED);
                }
          });
          return deferred.promise;
      };
      

      function hasOneProfile(profiles) {
          var deferred = $q.defer();
          UserProfile.then(function(userProfile) {
                if (userProfile.$hasOneProfile(profiles)) {
                      deferred.resolve(access.OK);
                } else {
                      deferred.reject(access.UNAUTHORIZED);
                }
          });
          return deferred.promise;
      };

      function hasAllProfile(profile) {
          var deferred = $q.defer();
          UserProfile.then(function(userProfile) {
                if (userProfile.$hasAllProfile(profile)) {
                      deferred.resolve(access.OK);
                } else {
                      deferred.reject(access.UNAUTHORIZED);
                }
          });
          return deferred.promise;
      };
  };
    
  //USER PROFILE
  angular
      .module('portalApp')
      .factory("UserProfile", useProfile);

      useProfile.$inject = ['$q', 'AnagraficaResource', '$http'];      

      function useProfile($q, AnagraficaResource, $http) {
            
            var fetchUserProfile = function() {
            var deferred = $q.defer();

            AnagraficaResource.getListaApplicazioniAbilitate(function(response) {
                  deferred.resolve({
                        $refresh : fetchUserProfile,
                        $isAppEnabled : function(appName) {
                              for (var index in response.applicazioni) {
                                    if (response.applicazioni[index].codice == appName)
                                          return true;
                              }
                              return false;
                        },
                        $hasProfile : function(profilo) {
                            for (var index in response.profilo) {
                                  if (response.profilo[index] == profilo)
                                        return true;
                            }
                            return false;
                        },
                        $hasOneProfile : function(profili) {
                            for (var index in profili) {
                                  if (this.$hasProfile(profili[index]))
                                        return true;
                            }
                            return false;
                        },
                        $hasAllProfile : function(profili) {
                            for (var index in profili) {
                                if (!this.$hasProfile(profili[index]))
                                      return false;
                          }
                          return true;
                        },
                        $getListaSis : function(appName) {
                              return response.sis[appName];
                        },
                        abilitazioni: response
                  });
            }, function(err){
                  deferred.reject(err);
            });
            return deferred.promise;
            };
            return fetchUserProfile();
      };

})();