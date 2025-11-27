
import { Post } from './types';

export const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    title: 'Understanding the Bitcoin Halving',
    author: 'Satoshi Nakamoto',
    date: 'April 20, 2024',
    imageUrl: 'https://picsum.photos/seed/bitcoin-halving/1200/600',
    content: `The Bitcoin halving is a pre-programmed event that occurs approximately every four years, or after every 210,000 blocks are mined. It cuts the reward for mining new blocks in half, which means miners receive 50% fewer bitcoins for verifying transactions. This mechanism is built into Bitcoin's code to control its supply, making it a deflationary asset. The total supply of Bitcoin is capped at 21 million, and halvings ensure this supply is released at a predictable, slowing rate.\n\nHistorically, halvings have been associated with significant price increases. By reducing the rate of new Bitcoin creation, the event creates a supply shock. If demand remains constant or increases, basic economics suggests the price will rise. The periods following the 2012, 2016, and 2020 halvings all saw substantial bull runs, though past performance is not indicative of future results. The event is a cornerstone of Bitcoin's economic model, designed to mimic the scarcity of precious metals like gold.`
  },
  {
    id: '2',
    title: 'The Rise of Decentralized Finance (DeFi)',
    author: 'Vitalik Buterin',
    date: 'April 15, 2024',
    imageUrl: 'https://picsum.photos/seed/defi-rise/1200/600',
    content: `Decentralized Finance, or DeFi, represents a paradigm shift from traditional, centralized financial systems. Built primarily on smart contract platforms like Ethereum, DeFi aims to create an open-source, permissionless, and transparent financial service ecosystem. This includes services like lending, borrowing, trading, and earning interest, all without the need for traditional financial intermediaries like banks or brokerages.\n\nThe core innovation of DeFi is its ability to build trust through code rather than institutions. Smart contracts automate agreements and transactions, ensuring they are executed as written. This has unlocked a wave of innovation, from decentralized exchanges (DEXs) like Uniswap to lending protocols like Aave and Compound. While still a nascent and volatile space, DeFi holds the promise of a more accessible, efficient, and equitable financial future for everyone.`
  },
    {
    id: '3',
    title: 'Exploring the Potential of Layer 2 Scaling Solutions',
    author: 'Jane Doe',
    date: 'April 10, 2024',
    imageUrl: 'https://picsum.photos/seed/layer-2/1200/600',
    content: `As blockchain networks like Ethereum have grown in popularity, they have faced significant scalability challenges, leading to high transaction fees and slow confirmation times. Layer 2 scaling solutions are frameworks or protocols built on top of a Layer 1 blockchain (like Ethereum) to address these issues. They work by processing transactions off the main chain, thereby reducing the load on the base layer and improving throughput.\n\nThere are several types of Layer 2 solutions, with the most prominent being optimistic rollups (e.g., Optimism, Arbitrum) and zero-knowledge (ZK) rollups (e.g., zkSync, StarkNet). Rollups bundle or "roll up" hundreds of off-chain transactions into a single transaction that is then submitted to the main chain. This drastically reduces fees and increases transaction speed without sacrificing the security of the underlying Layer 1 network. Layer 2s are critical for the mass adoption of blockchain technology, making decentralized applications more practical and affordable for everyday users.`
  },
];
