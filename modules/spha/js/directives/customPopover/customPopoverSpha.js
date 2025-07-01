(function () { 
 'use strict';
angular.module( 'customPopoverSpha', [] )
  .directive( 'customPopoverSpha', ['$http', '$filter',  function ( $http, $filter ) {
        var template = '<i class="fa fa-question-circle-o" aria-hidden="true"></i>';
        var trigger = 'hover'; //default trigger event
        var labels = [];
        
        
        $http.get( 'modules/spha/js/directives/customPopover/customPopoverTextSpha.json' )
          .then( function( data ){
              labels = data.data;
          });

        return {
            restrict: 'EA',
            link: function ( scope, el, attrs ) {
            			//trigger events allowed
                        switch( attrs.customPopoverTrigger ){
                          case 'hover':
                          case 'click':
                            trigger = attrs.customPopoverTrigger;
                            break;
                          default:
                            break;
                        }
                         /*
                          * Se il popover è utilizzato come attributo 
                          *  questo viene appeso all'elemento 
                          *  a cui è applicato 
                          */
                        if( el.context != "<custom-popover-spha>" ){
                          $(el).append(" " + template);
                        }

                        $(el).popover({
                            trigger: trigger,
                            html: true,
                            replace: true,
                            content: function(){
                            	/*
                            	 * Testo configurabile tramite attibuto custom-popover-text
                            	 * oppure tramite id dell'elemento a cui è applicato.
                            	 * Se non viene settato alcun testo allora testo di default,
                            	 * eventualmente personalizzabile nel file 
                            	 * customPopoverText.json
                            	 */
                              if( attrs.customPopoverText ){
                                return attrs.customPopoverText;
                              }else{
                                  if( el.context.id ){
                                      for( var i in labels ){
                                        if( labels[i].id == el.context.id ){
                                            return  $filter( 'translate' )( labels[i].name );
                                        }
                                      }
                                  }else{
                                	  for( var i in labels ){
                                          if( labels[i].id == "defaultText" ){
                                              return  $filter( 'translate' )( labels[i].name );
                                          }
                                      }
                                  }
                              }
                            },
                            placement: function(){ //posizionamento del popover (default top)
                                switch( attrs.customPopoverPlacement ){
                                  case "top":
                                  case "bottom":
                                  case "right":
                                  case "left":
                                    return attrs.customPopoverPlacement;
                                  default:
                                    return "top";
                                }
                            }
                        });

                  }
                };
    }]);
})();
