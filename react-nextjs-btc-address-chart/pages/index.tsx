import Head from 'next/head';
import Layout from '../components/layout';
import { GetStaticProps } from 'next';
import btcAddresses from '../lib/btcAddresses';
import { format as dateFormat, subMonths, startOfYear } from 'date-fns';
import { format as _format } from 'd3-format';
import { useState, useEffect, useMemo } from 'react';
import FilterButtons from '../components/filterButtons';
import { ResponsiveContainer, LineChart, XAxis, YAxis, Line, Tooltip, CartesianGrid, Legend } from 'recharts';

const labels: { [key: string]: any } = {
    'BTC / Addr Cnt of Bal ≥ $1K': { short: '>$1k', color: '#1e00fe' },
    'BTC / Val in Addrs w/ Bal ≥ $10K USD': { short: '>$10k', color: '#f6c244' },
    'BTC / Val in Addrs w/ Bal ≥ $100K USD': { short: '>$100k', color: '#fe0001' },
    'BTC / Val in Addrs w/ Bal ≥ $1M USD': { short: '>$1M', color: '#b7b0e3' },
    'BTC / Val in Addrs w/ Bal ≥ $10M USD': { short: '>$10M', color: '#ee01fe' },
}

type Filters = 'ALL' | 'YTD' | '12M' | '3M' | '1M';
type FilterIndices = {
    'ALL'?: number,
    'YTD': number,
    '12M': number,
    '3M': number,
    '1M': number,
};

const yAxisFormat = _format('.2s');
const toolTipFormat = _format('.3s');

export default function Home({ data = [], filterIndices }: { data: any[], filterIndices: FilterIndices}) {

    // fetch all data
    const [fullData, setFullData] = useState<any[]>([]);
    useEffect(() => {
        fetch('/api/btc-addresses')
            .then(res => res.json())
            .then(setFullData);
    }, []);

    // data filtering
    const [filter, setFilter] = useState<Filters>('12M');
    const [filteredData, setFilteredData] = useState<any []>([]);
    useEffect(() => {
        if (filter === 'ALL') {
            setFilteredData(fullData);
        } else {
            setFilteredData(data.slice(filterIndices[filter] || 0));
        }
    }, [fullData, filter]);

    // line opacity on hover
    const [hovered, setHovered] = useState('');

    const yearTicks: string[] = useMemo(() => {
        if (!fullData.length) return [];
        const firstYear = Number(fullData[0]['Time'].split('-')[0]);
        const lastYear = Number(fullData[fullData.length - 1]['Time'].split('-')[0]);
        const numYears = lastYear - firstYear;
        return Array.from(Array(numYears).keys()).map(y => (y + firstYear + 1) + '-01-01');
    }, [fullData]);

    return (
        <Layout home>
            <Head>
                <title>BTC Address Balances over Time</title>
            </Head>
            <section>
                <div className="mx-auto p-8 text-center">
                    {!data.length ? 'No data yet ...' : 
                    <ResponsiveContainer width="100%" aspect={3}>
                        <LineChart data={filteredData}>
                            <Tooltip 
                                labelFormatter={label => new Date(label + 'T00:00:00').toLocaleDateString()}
                                wrapperClassName="text-xs"
                                formatter={(value, name) => [
                                    toolTipFormat(Number(value)),
                                    labels[name].short,
                                ]}
                            />
                            <Legend 
                                verticalAlign="top"
                                formatter={(value: string) => 
                                    <span className='text-black text-xs'>{labels[value].short}</span>}
                            />
                            <XAxis
                                dataKey="Time"
                                tickLine={false}
                                minTickGap={45}
                                tickFormatter={filter === 'ALL' ?
                                    (t: string) => new Date(t+'T00:00:00').getFullYear() + '' :
                                    (t: string) => dateFormat(new Date(t+'T00:00:00'), 'd MMM')
                                }
                                ticks={filter === 'ALL' ? yearTicks : undefined}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={yAxisFormat}
                            />
                            <CartesianGrid vertical={false} />
                            {Object.keys(labels).map((label) => 
                                <Line 
                                    key={label} 
                                    dataKey={label} 
                                    dot={false}
                                    activeDot={{
                                        onMouseEnter: () => setHovered(label),
                                        onMouseLeave: () => setHovered(''),
                                    }}
                                    label={labels[label].short}
                                    stroke={labels[label].color}
                                    strokeWidth={2}
                                    strokeOpacity={hovered && label !== hovered ? 0.5 : 1}
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>}
                    <FilterButtons filter={filter} onChange={setFilter} />
                </div>
            </section>
        </Layout>
    )
}

// anything inside 12M will be included here
// this will keep initial transit size down
// the rest of the data (back to 2010) will be fetched on page load
export const getStaticProps: GetStaticProps = async () => {
    const data: any[] = await btcAddresses();
    let truncatedData: any[] = [];

    const latestDate = new Date(`${data[data.length - 1]['Time']}T00:00:00`);
    const date1M = dateFormat(subMonths(latestDate, 1), 'yyyy-MM-dd');
    const date3M = dateFormat(subMonths(latestDate, 3), 'yyyy-MM-dd');
    const date12M = dateFormat(subMonths(latestDate, 12), 'yyyy-MM-dd');
    const dateYTD = dateFormat(startOfYear(latestDate), 'yyyy-MM-dd');
    const filterIndices: FilterIndices = {
        'YTD': 0,
        '12M': 0,
        '3M': 0,
        '1M': 0,
    };
    for (var i = data.length - 1; i > 0; i--) {
        const currDate = data[i]['Time'];
        // don't perform the eq check if we have the index already
        if (currDate === date1M) filterIndices['1M'] = i;
        if (currDate === date3M) filterIndices['3M'] = i;
        if (currDate === dateYTD) filterIndices['YTD'] = i;
        if (currDate === date12M) {
            filterIndices['1M'] -= i;
            filterIndices['3M'] -= i;
            filterIndices['YTD'] -= i;
            truncatedData = data.slice(i);
            break; // 12M will always be longest, we have all the indices now
        }
    }
    
    return {
        props: { data: truncatedData, filterIndices },
    }
}
