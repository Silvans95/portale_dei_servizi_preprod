/// <reference path="../enums/SignMethod.ts"/>

namespace FET {

    export class EnumUtils {

        public static values<T>( enumeration: object ): T[] {
            let values: any[] = [];
            for ( let value in enumeration ) {
                if ( Number.isNaN( Number( value ) ) ) {
                    values.push( value );
                }
            }
            return values;
        }

        public static numericKey( enumeration: object, key: any ): number {
            let actualKey = key;
            // Get the numeric enumeration value
            if ( Number.isNaN( Number( actualKey ) ) ) {
                actualKey = enumeration[key];
            }
            //
            return Number.isNaN( Number( actualKey ) )
                ? undefined
                : parseInt( actualKey );
        }

        public static stringKey( enumeration: object, key: any ): number {
            let actualKey = key;
            // Get the numeric enumeration value
            if ( !Number.isNaN( Number( actualKey ) ) ) {
                actualKey = enumeration[key];
            }
            //
            return actualKey;
        }

        public static exists( enumeration: object, key: any ): boolean {
            return EnumUtils.numericKey( enumeration, key ) !== undefined;
        }

    }

}
