import { NextApiRequest, NextApiResponse } from 'next';
import getBtcAddresses from '../../lib/btcAddresses';

export default async (_: NextApiRequest, res: NextApiResponse) => {
  const data = await getBtcAddresses();
  return res.status(200).json(data);
}