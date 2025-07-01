declare namespace FET {
    
    export interface APICallback<T> {
        
        success?( data : T );
        
        error?( message : string );
        
    }
    
}
