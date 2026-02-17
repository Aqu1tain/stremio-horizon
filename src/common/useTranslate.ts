import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

type CatalogInfo = {
    addon?: { manifest: { id: string } };
    id?: string;
    name?: string;
    type?: string;
};

const useTranslate = () => {
    const { t } = useTranslation();

    const string = useCallback((key: string) => t(key), [t]);

    const stringWithPrefix = useCallback((value: string, prefix: string, fallback: string | null = null) => {
        const key = `${prefix}${value}`;
        const defaultValue = fallback ?? value.charAt(0).toUpperCase() + value.slice(1);

        return t(key, {
            defaultValue,
        });
    }, [t]);

    const catalogTitle = useCallback((info: CatalogInfo = {}, withType = true) => {
        const { addon, id, name, type } = info;
        if (addon && id && name) {
            const partialKey = `${addon.manifest.id.split('.').join('_')}_${id}`;
            const translatedName = stringWithPrefix(partialKey, 'CATALOG_', name);

            if (type && withType) {
                const translatedType = stringWithPrefix(type, 'TYPE_');
                return `${translatedName} - ${translatedType}`;
            }

            return translatedName;
        }

        return null;
    }, [stringWithPrefix]);

    return {
        string,
        stringWithPrefix,
        catalogTitle,
    };
};

export type { CatalogInfo };
export default useTranslate;
