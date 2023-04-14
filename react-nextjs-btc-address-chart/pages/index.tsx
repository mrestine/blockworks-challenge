import Head from 'next/head';
import Layout from '../components/layout';
import { GetStaticProps } from 'next';
import btcAddresses from '../lib/btcAddresses';
import { format as _format } from 'd3-format';
import { useState, useEffect } from 'react';
import FilterButtons from '../components/filterButtons';
import getFilterIndices from '../utils/getFilterIndices';
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
    'YTD'?: number,
    '12M'?: number,
    '3M'?: number,
    '1M'?: number,
};

const yAxisFormat = _format('.2s');
const toolTipFormat = _format('.3s');

export default function Home({ data = [], filterIndices }: { data: any[], filterIndices: FilterIndices}) {

    // data filtering
    const [filter, setFilter]: [Filters, Function] = useState('12M');
    const [filteredData, setFilteredData]: [any[], Function] = useState([]);
    useEffect(() => {
        if (!filterIndices['1M']) return;
        setFilteredData(data.slice(filterIndices[filter] || 0));
    }, [filterIndices, filter]);

    // line opacity on hover
    const [hovered, setHovered] = useState('');

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
                                minTickGap={40}
                                tickFormatter={(t) => new Date(t+'T00:00:00').toLocaleDateString()}
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

export const getStaticProps: GetStaticProps = async () => {
    const data: any[] = await btcAddresses();
    const filterIndices: FilterIndices = getFilterIndices(data);
    return {
        props: { data, filterIndices },
    }
}
