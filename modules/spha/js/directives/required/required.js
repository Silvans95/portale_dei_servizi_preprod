'use strict';
(function(){
angular.module('required', [])
	.directive("required", function() {
	   return {
	       restrict: 'A', //only want it triggered for attributes
	       link: function( scope, el, attrs ) {	  
	    	   if( !attrs.disableRequiredPlugin ){
		    	   if( !attrs.ngRequired ){
			    	   var parent = $( el ).parent();
			    	   if( parent && parent.parent().get( 0 ).firstElementChild.tagName.toLowerCase() == "label"
 						     && parent.parent().get( 0 ).firstElementChild.attributes["for"] ){
		    				   parent.parent().prepend( "<span class='requireClass' style='color:red;'>*</span>" );
		    			}else if( parent && parent.parent().get( 0 ).firstElementChild.tagName.toLowerCase() == "label" ){
		    				parent = parent.parent();
		    				 if( parent && parent.parent().get( 0 ).firstElementChild.tagName.toLowerCase() == "label"
	   						     && parent.parent().get( 0 ).firstElementChild.attributes["for"] ){
			    				   parent.parent().prepend( "<span class='requireClass' style='color:red;'>*</span>" );
		    				 }
		    			}
		    	   }
	       	}
	       }
	   }
	})
	.directive("ngRequired", function() {
	   return {
	       restrict: 'A', //only want it triggered for attributes
	       link: function( scope, el, attrs ) {
	    	   if( !attrs.disableRequiredPlugin ){
		    	   scope.$watch(attrs.ngRequired,function(required){
	    		   		if(required == true){
	   						var parent = $( el ).parent();
	   						if( parent.parent().get( 0 ).className == "radio" ){
	   							if( parent.parent().parent().get( 0 ).firstElementChild.tagName.toLowerCase() == "label" &&
	   									parent.parent().parent().get( 0 ).firstElementChild.attributes["for"] ){
	   									parent.parent().parent().prepend( "<span class='requireClass' style='color:red;'>*</span>" ); 
	   							}
	   						} 
	   						else if( parent && parent.parent().get( 0 ).firstElementChild.tagName.toLowerCase() == "label"
		   						     && parent.parent().get( 0 ).firstElementChild.attributes["for"] ){
				    				   parent.parent().prepend( "<span class='requireClass' style='color:red;'>*</span>" );
				    			}else if( parent && parent.parent().get( 0 ).firstElementChild.tagName.toLowerCase() != "label" ){
				    				parent = parent.parent();
				    				 if( parent && parent.parent().get( 0 ).firstElementChild.tagName.toLowerCase() == "label"
			   						     && parent.parent().get( 0 ).firstElementChild.attributes["for"] ){
					    				   parent.parent().prepend( "<span class='requireClass' style='color:red;'>*</span>" );
				    				 }
				    			}
	   					}else if(required==false){
	   						var span = $(el).parent().parent().find(".requireClass");
	   						if( span.length ){
	   							$( span ).remove();
	   						}else{
	   							if( $( el ).parent().parent().parent().get( 0 ).className.indexOf( "col" ) > -1  ){
	   								span = $(el).parent().parent().parent().find(".requireClass");
	   								if(  span.length ){
	   									$( span ).remove();
	   								}
	   							}
	   						}
//	   						}else{
//	   							span = $(el).parent().parent().parent().find(".requireClass");
//	   							$( span ).remove();
//	   						}
			    		}	   						
   	   				});
	       	  }
	    	}
	      }
	});
	
})();