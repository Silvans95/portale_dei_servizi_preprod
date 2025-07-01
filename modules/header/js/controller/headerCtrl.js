(function () {

  'use strict';

  angular
    .module('headerApp')
    .controller('headerCtrl', headerController)
       .$inject = ['$scope', '$rootScope', 'AnagraficaResource', 'NotificheResources', 'PropertiesService', ,'$timeout', '$q'];
  function headerController($scope, $rootScope, AnagraficaResource, NotificheResource, PropertiesService, $timeout, $q) {

    var menuLinks = [];
    var secondaryMenuLinks = [];
    var horizontalMenuLinks = [];

    var headerMenuConfig = PropertiesService.get("headerMenuConfig") ? PropertiesService.get("headerMenuConfig") : {};
    $scope.appId = localStorage.getItem("codiceApplicazione") ? localStorage.getItem("codiceApplicazione") : "DHB";
    $scope.isAppNas = false;
    $scope.defaultLang = 'IT';

  $scope.servicesConfig = {
      configurations: [{
        name: 'LEGACY_SERVICES',
        host: PropertiesService.get("abilitazioniBaseUrl") ? PropertiesService.get("abilitazioniBaseUrl") : ""
      }],
    };

    $scope.isUserInfoLoaded = false;

    class SmartHeaderMenu {
      constructor({ menuLinks, secondaryMenuLinks, horizontalMenuLinks }) {
        this.menuLinks = menuLinks;
        this.secondaryMenuLinks = secondaryMenuLinks;
        this.horizontalMenuLinks = horizontalMenuLinks;
      }
    };
  function settaLinguaMenuLinks(language, menu) {
    const langKey = language.toLowerCase();  

    const dynamicLangKey = `text_${langKey}`;

    if (menu[dynamicLangKey]) {
        return menu[dynamicLangKey];  
    }

  }

    function createSmartHeaderMenu(language) {
      if(menuLinks.length > 0){
        menuLinks.length = 0;
        secondaryMenuLinks.length = 0;
        horizontalMenuLinks.length = 0;
      }
      if (headerMenuConfig.menuLinks) {
        angular.forEach(headerMenuConfig.menuLinks, function(menuLink) {
          if(!$scope.isButtonChangePassActive){
            if(menuLink.linkId === 'changePassword') {
              return;
            }
          }
            menuLinks.push({
                icon: menuLink.icon,
                href: menuLink.href,
                text:language == $scope.defaultLang ? menuLink.text : settaLinguaMenuLinks(language, menuLink),
                linkId: menuLink.linkId,
                disabled: menuLink.disabled,
                target: menuLink.target
            });
        });
    }

    if (headerMenuConfig.secondaryMenuLinks) {
        angular.forEach(headerMenuConfig.secondaryMenuLinks, function(secondaryMenuLink) {
            secondaryMenuLinks.push({
                icon: secondaryMenuLink.icon,
                href: secondaryMenuLink.href,
                text:language == $scope.defaultLang ? secondaryMenuLink.text : settaLinguaMenuLinks(language, secondaryMenuLink),
                linkId: secondaryMenuLink.linkId,
                disabled: secondaryMenuLink.disabled,
                target: secondaryMenuLink.target
            });
        });
    }

    if (headerMenuConfig.horizontalMenuLinks) {
        angular.forEach(headerMenuConfig.horizontalMenuLinks, function(horizontalMenuLink) {
          if(!$scope.isAppNas){
            if(horizontalMenuLink.text === 'Notifiche') {
              return;
            }
          }
            horizontalMenuLinks.push({
                icon: horizontalMenuLink.icon,
                href: horizontalMenuLink.href,
                text: language == $scope.defaultLang ? horizontalMenuLink.text : settaLinguaMenuLinks(language, horizontalMenuLink),
                linkId: horizontalMenuLink.linkId,
                disabled: horizontalMenuLink.disabled,
                target: horizontalMenuLink.target
            });
        });
    }

    const headerMenu = new SmartHeaderMenu({
      menuLinks: menuLinks,
      secondaryMenuLinks: secondaryMenuLinks,
      horizontalMenuLinks: horizontalMenuLinks
    });

    return {...headerMenu, menuLinks: [...menuLinks], secondaryMenuLinks: [...secondaryMenuLinks], horizontalMenuLinks: [...horizontalMenuLinks]};

  };


  $q.when(AnagraficaResource.getUserInfo().$promise).then(function(response) {
    if (response) {
      $scope.isButtonChangePassActive = response.content.statoUtenteDto.userCanChangePasswordOtp;

      let currentApp = localStorage.getItem("codiceApplicazione");

      $q.when(AnagraficaResource.get().$promise).then(function(data) {
        var user = JSON.stringify(data);
        localStorage.setItem("user", user);
        $q.when(NotificheResource.getApplicazioniNas().$promise).then(function(responseArray) {
          if (responseArray.includes(currentApp)) {
            $scope.isAppNas = true;
          }

          $scope.headerMenu = createSmartHeaderMenu($scope.defaultLang);
          $scope.isUserInfoLoaded = true;

          var checkUserInfoLoaded = function() {
            if ($scope.isUserInfoLoaded) {
              let headerTag = document.getElementById('headerId');
              headerTag.aHeaderMenu = $scope.headerMenu;
              headerTag.addEventListener('eMenuClick', function(event) {
                $scope.$apply(function() {
                    window.open(event.detail.href, event.detail.target);
                });
              });

              const langSelector = document.querySelector('#lang-selector');
              
              if (langSelector) {
                langSelector.addEventListener('ePayload', function(event) {
                $scope.languageMenu = createSmartHeaderMenu(event.detail);
                $scope.$apply(function() {
                  headerTag.aHeaderMenu = $scope.languageMenu;
                  $scope.changeLanguage(event.detail);
                  $rootScope.selectedLang = (event.detail).toLowerCase();                  
                });
              });
              }
            } else {
              $timeout(checkUserInfoLoaded, 300);
            }
          };

          checkUserInfoLoaded();

        })
        .catch(function(error) {
          console.error("Errore nel recupero delle applicazioni:", error);
        });

      })
      .catch(function(error) {
        console.error("Errore nel recupero dell'anagrafica utente':", error);
      });

    }
  }).catch(function(error) {
    console.error("Errore nel caricamento delle informazioni utente:", error);
  });

  };

})();
