import { format, subMonths, startOfYear } from 'date-fns';

export default function getFilterIndices (data: any[]) {
    if (!data.length) return {};
    const latestDate = new Date(`${data[data.length - 1]['Time']}T00:00:00`);
    const date1M = format(subMonths(latestDate, 1), 'yyyy-MM-dd');
    const date3M = format(subMonths(latestDate, 3), 'yyyy-MM-dd');
    const date12M = format(subMonths(latestDate, 12), 'yyyy-MM-dd');
    const dateYTD = format(startOfYear(latestDate), 'yyyy-MM-dd');
    const ret = {
        'YTD': 0,
        '12M': 0,
        '3M': 0,
        '1M': 0,
    };
    for (var i = data.length - 1; i > 0; i--) {
        const currDate = data[i]['Time'];
        // don't perform the eq check if we have the index already
        // truthy check is faster than str eq, iirc
        // break when we have everything
        if (!ret['1M'] && currDate === date1M) ret['1M'] = i;
        if (!ret['3M'] && currDate === date3M) ret['3M'] = i;
        if (!ret['YTD'] && currDate === dateYTD) ret['YTD'] = i;
        if (!ret['12M'] && currDate === date12M) {
            ret['12M'] = i;
            break; // 12M will always be longest, we have all the indices now
        }
    }
    return ret;
}