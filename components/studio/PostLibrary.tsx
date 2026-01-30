'use client';

import { useState } from 'react';
import { ThumbsUp, MessageSquare, ArrowRight } from 'lucide-react';

export interface Post {
  id: string;
  author: string;
  role: string;
  timeAgo: string;
  content: string;
  likes: number;
  comments: number;
  image?: string;
  url?: string;
}

const YOUR_POSTS: Post[] = [
  {
    id: 'thor-1',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '3h',
    content: 'Three years at GSOBA and I finally understand what people mean when they say company culture matters.\n\nUnlimited PTO that we actually use. No meetings for the sake of meetings. Remote-first from day one. A team that genuinely cares about the work and each other.\n\nIf you told me in 2021 that I\'d find a place like this, I wouldn\'t have believed you.',
    likes: 1892,
    comments: 167,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7422433472629174272/',
  },
  {
    id: 'thor-2',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '1d',
    content: 'POV: You open Slack for "just a second" and there are 347 unread messages waiting for you.\n\nSolution: Pretend you never saw them and go back to deep work.\n\nAnyone else at GSOBA master this technique?',
    likes: 1243,
    comments: 89,
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7422433111449251840/',
  },
  {
    id: 'thor-3',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '2d',
    content: 'first week at gsoba i tried to look busy and my manager told me to go outside.\n\napparently staring intensely at a laptop is not a deliverable.\n\nneither is being "very online."\n\ni was informed that if the work is done, i am also done.\n\nthis was confusing because at my last job, anxiety was considered engagement.\n\nstill unlearning that.\nstill enjoying the sunlight.',
    likes: 3421,
    comments: 234,
    image: 'https://media.licdn.com/dms/image/v2/D4E22AQErG6j7TD8tNQ/feedshare-shrink_2048_1536/B4EZwPTTvwGwAk-/0/1769783246164?e=1771459200&v=beta&t=wrCmTso4pc2hD0ys0NfjDaebMBEyNTqlhAuMQcgQkeM',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7422432808683520000/',
  },
  {
    id: 'thor-4',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '3d',
    content: 'Client at 4:55 PM on Friday: "Can we hop on a quick call?"\n\nMe: Already mentally checked out and halfway through my weekend plans.\n\nUpdate: We did not hop on that call. Monday works just fine.',
    likes: 2156,
    comments: 124,
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop',
  },
  {
    id: 'thor-5',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '4d',
    content: 'My engineering team asked for 3 sprints to build this feature.\n\nI gave them 4.\n\nThey shipped it in 2.\n\nThis is what happens when you stop pretending you know better than the people actually building the thing.',
    likes: 5892,
    comments: 412,
  },
  {
    id: 'thor-6',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '5d',
    content: 'Reminder: Your user research is not complete until you talk to users who HATE your product.\n\nThe fans will always be nice. The critics will make you better.',
    likes: 2134,
    comments: 178,
  },
  {
    id: 'thor-7',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '6d',
    content: 'Stop optimizing for perfection. Start optimizing for learning.\n\nShip the MVP. Get feedback. Iterate. Repeat.\n\nYour customers don\'t care about your perfect vision. They care about their problems getting solved.',
    likes: 4321,
    comments: 289,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
  },
  {
    id: 'thor-8',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '1w',
    content: 'The CEO just asked me "what\'s our AI strategy?"\n\nI said "we solve customer problems. Sometimes that involves AI. Sometimes it doesn\'t."\n\nDon\'t chase technology. Chase value.',
    likes: 7234,
    comments: 567,
  },
  {
    id: 'thor-9',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '1w',
    content: 'Hot take: Most product roadmaps are just fancy wishful thinking documents.\n\nShow me your backlog priorities and I\'ll show you your actual strategy.',
    likes: 3890,
    comments: 423,
  },
  {
    id: 'thor-10',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '1w',
    content: 'Spent 3 hours in user interviews today. Learned more than I did in the last 3 months of internal meetings.\n\nGet out of the building. Talk to actual humans. Your assumptions are probably wrong.',
    likes: 2567,
    comments: 198,
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop',
  },
  {
    id: 'thor-11',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '1w',
    content: 'My product management philosophy in 3 words:\n\nShip. Learn. Iterate.',
    likes: 4521,
    comments: 312,
  },
  {
    id: 'thor-12',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '2w',
    content: 'Just killed a feature we\'ve been building for 6 months.\n\nUser testing showed it solved a problem nobody actually has.\n\nSunk cost fallacy is real. Don\'t ship things just because you started them.',
    likes: 5678,
    comments: 445,
  },
  {
    id: 'thor-13',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '2w',
    content: 'Engineering wants more time. Sales wants more features. Marketing wants a prettier UI.\n\nAnd the user just wants their checkout to work on mobile.\n\nGuess which one we\'re fixing first?',
    likes: 3245,
    comments: 267,
    image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&h=400&fit=crop',
  },
  {
    id: 'thor-14',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '2w',
    content: 'The best product managers I know have one thing in common:\n\nThey\'re comfortable being wrong.',
    likes: 4892,
    comments: 389,
  },
  {
    id: 'thor-15',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '2w',
    content: 'Your product vision should fit on a napkin. If it doesn\'t, you don\'t have a vision. You have a novel.',
    likes: 2987,
    comments: 221,
  },
  {
    id: 'thor-16',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '3w',
    content: 'Unpopular opinion: Most A/B tests are just theater.\n\nIf you need a 5% lift in conversion to justify a decision, you\'re optimizing the wrong thing.\n\nFocus on 10x improvements, not 10% tweaks.',
    likes: 6234,
    comments: 512,
  },
  {
    id: 'thor-17',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '3w',
    content: 'New PM mistake: Building features users ask for.\n\nExperienced PM move: Solving problems users complain about.\n\nThere\'s a difference.',
    likes: 5421,
    comments: 434,
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop',
  },
  {
    id: 'thor-18',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '3w',
    content: 'The product team shipped 23 features this quarter.\n\nUsers adopted 4 of them.\n\nThis is why I\'m obsessed with retention metrics, not release velocity.',
    likes: 3876,
    comments: 298,
  },
  {
    id: 'thor-19',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '3w',
    content: 'Someone just asked me "what\'s your north star metric?"\n\nI said "revenue."\n\nThey looked disappointed. But users who pay are users who stay.',
    likes: 4567,
    comments: 378,
  },
  {
    id: 'thor-20',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '4w',
    content: 'Your competitor just launched that feature you\'ve been debating for 6 months.\n\nGood. Now you can watch them make all the mistakes you were afraid of.\n\nSometimes being second is the smarter play.',
    likes: 5892,
    comments: 467,
  },
  {
    id: 'thor-21',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '4w',
    content: 'I don\'t care how many features your product has. I care how many problems it solves.\n\nFeatures are liabilities. Solutions are assets.',
    likes: 4321,
    comments: 334,
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop',
  },
  {
    id: 'thor-22',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '4w',
    content: 'Design is thinking made visual. — Saul Bass\n\nThis quote changed how I approach product specs. Show, don\'t tell.',
    likes: 2987,
    comments: 187,
  },
  {
    id: 'thor-23',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '1mo',
    content: 'Every product manager should spend 1 day a month in customer support.\n\nYou\'ll learn more about your product\'s flaws in 8 hours than in 8 weeks of meetings.',
    likes: 6543,
    comments: 523,
  },
  {
    id: 'thor-24',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '1mo',
    content: 'The best product decisions I\'ve made all had one thing in common: I shipped them scared.\n\nIf you\'re not at least a little nervous, you\'re probably not thinking big enough.',
    likes: 5234,
    comments: 412,
  },
  {
    id: 'thor-25',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '1mo',
    content: 'Just reviewed our analytics. 80% of our users only use 20% of our features.\n\nTime to simplify, not add more.',
    likes: 4892,
    comments: 367,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
  },
  {
    id: 'thor-26',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '1mo',
    content: 'Product management is 10% building the right thing and 90% getting everyone to agree it\'s the right thing.',
    likes: 7654,
    comments: 589,
  },
  {
    id: 'thor-27',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '1mo',
    content: 'Your engineering team is not a feature factory. Stop treating them like one.\n\nGive them problems, not solutions. You might be surprised by what they come up with.',
    likes: 8921,
    comments: 678,
  },
  {
    id: 'thor-28',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '1mo',
    content: 'The hardest part of product management isn\'t deciding what to build. It\'s deciding what NOT to build.',
    likes: 5432,
    comments: 423,
  },
  {
    id: 'thor-29',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '1mo',
    content: 'Just had a user call our new feature "life-changing."\n\nAll we did was remove 3 clicks from their daily workflow.\n\nNever underestimate the power of removing friction.',
    likes: 6234,
    comments: 478,
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop',
  },
  {
    id: 'thor-30',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '2mo',
    content: 'If you\'re not embarrassed by your first release, you shipped too late.',
    likes: 4567,
    comments: 356,
  },
  {
    id: 'thor-31',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '2mo',
    content: 'Three things I wish I knew when I started in product:\n\n1. Users don\'t care about your clever solution\n2. Revenue is a lagging indicator\n3. The best PMs listen more than they talk',
    likes: 7892,
    comments: 612,
  },
  {
    id: 'thor-32',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '2mo',
    content: 'Stop asking users what they want. Start watching what they do.\n\nBehavior > Feedback',
    likes: 5321,
    comments: 434,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
  },
  {
    id: 'thor-33',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '2mo',
    content: 'The CEO wants growth. Engineering wants stability. Sales wants features.\n\nThe product manager\'s job is to disappoint everyone equally.',
    likes: 6543,
    comments: 521,
  },
  {
    id: 'thor-34',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '2mo',
    content: 'Your product roadmap is not a contract. It\'s a hypothesis.\n\nTreat it accordingly.',
    likes: 4234,
    comments: 312,
  },
  {
    id: 'thor-35',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '2mo',
    content: 'I\'ve never seen a product fail because it shipped too simple.\n\nI\'ve seen hundreds fail because they shipped too complex.',
    likes: 8765,
    comments: 687,
  },
  {
    id: 'thor-36',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '2mo',
    content: 'User feedback is like vegetables. Everyone knows they should consume more, but somehow we keep reaching for the junk food of assumptions.',
    likes: 3987,
    comments: 289,
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop',
  },
  {
    id: 'thor-37',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '3mo',
    content: 'Controversial take: OKRs are mostly useless if everyone hits their targets.\n\nIf you\'re not missing some objectives, you\'re not aiming high enough.',
    likes: 5678,
    comments: 467,
  },
  {
    id: 'thor-38',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '3mo',
    content: 'The best product strategy I ever wrote was 3 sentences long.\n\nIf you can\'t explain your strategy in 30 seconds, you don\'t have one.',
    likes: 6234,
    comments: 512,
  },
  {
    id: 'thor-39',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '3mo',
    content: 'Just shipped a feature that took 3 sprints to build and 30 seconds to explain.\n\nThat\'s when you know you got it right.',
    likes: 4321,
    comments: 334,
  },
  {
    id: 'thor-40',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '3mo',
    content: 'Your users don\'t care about your tech stack. They care about loading times.\n\nChoose boring technology that works over exciting technology that might.',
    likes: 5892,
    comments: 445,
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop',
  },
  {
    id: 'thor-41',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '3mo',
    content: 'The product teams that move fast aren\'t the ones with the best tools. They\'re the ones with the clearest priorities.',
    likes: 7234,
    comments: 578,
  },
  {
    id: 'thor-42',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '3mo',
    content: 'Every feature you ship is a promise you make to maintain it forever.\n\nChoose wisely.',
    likes: 4567,
    comments: 378,
  },
  {
    id: 'thor-43',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '3mo',
    content: 'Data tells you what users do. Interviews tell you why.\n\nYou need both.',
    likes: 5234,
    comments: 423,
  },
  {
    id: 'thor-44',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '4mo',
    content: 'Just realized we\'ve been measuring the wrong metric for 6 months.\n\nWe were optimizing for sign-ups when we should have been optimizing for activation.\n\nVanity metrics will kill your product.',
    likes: 6789,
    comments: 534,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
  },
  {
    id: 'thor-45',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '4mo',
    content: 'Your product doesn\'t need more features. It needs better onboarding.',
    likes: 8234,
    comments: 645,
  },
  {
    id: 'thor-46',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '4mo',
    content: 'The best product managers are professional pessimists.\n\nThey imagine everything that could go wrong so their users never have to experience it.',
    likes: 5432,
    comments: 434,
  },
  {
    id: 'thor-47',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '4mo',
    content: 'I spent 2 years building products engineers loved.\n\nThen I spent 2 years building products users paid for.\n\nGuess which skill is more valuable?',
    likes: 7654,
    comments: 589,
  },
  {
    id: 'thor-48',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '4mo',
    content: 'Product management is the art of saying "we\'ll revisit that next quarter" in 47 different ways.',
    likes: 4892,
    comments: 378,
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop',
  },
  {
    id: 'thor-49',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '4mo',
    content: 'Your product\'s biggest competitor isn\'t another company. It\'s the status quo.\n\nMake switching worth it.',
    likes: 6234,
    comments: 489,
  },
  {
    id: 'thor-50',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '5mo',
    content: 'The difference between a junior PM and a senior PM:\n\nJunior PM: "Users want this feature"\nSenior PM: "Users are trying to solve this problem"',
    likes: 9876,
    comments: 723,
  },
  {
    id: 'thor-51',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '5mo',
    content: 'Building products is easy. Building the RIGHT products is hard.\n\nBuilding the right products at the right time? That\'s the job.',
    likes: 5678,
    comments: 445,
  },
  {
    id: 'thor-52',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '5mo',
    content: 'Just deleted 15 pages from our product spec.\n\nIf you can\'t explain it simply, you don\'t understand it well enough.',
    likes: 4321,
    comments: 334,
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop',
  },
  {
    id: 'thor-53',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '5mo',
    content: 'Your roadmap is not a to-do list. It\'s a communication tool.\n\nIf stakeholders are surprised by what you\'re building, you\'re doing it wrong.',
    likes: 6543,
    comments: 512,
  },
  {
    id: 'thor-54',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '5mo',
    content: 'Product-market fit is not a destination. It\'s a journey.\n\nWhat worked last year might not work this year. Stay paranoid.',
    likes: 5234,
    comments: 423,
  },
  {
    id: 'thor-55',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '5mo',
    content: 'The best product ideas come from people closest to the problem:\n\n1. Customer support\n2. Sales\n3. Your actual users\n\n...and dead last: the executive team.',
    likes: 8765,
    comments: 678,
  },
  {
    id: 'thor-56',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '6mo',
    content: 'We just crossed 100k users. Here\'s what I learned:\n\n• Scale reveals all your sins\n• Technical debt comes for everyone\n• User feedback gets noisier, not clearer\n• Your original vision was probably wrong',
    likes: 7892,
    comments: 612,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
  },
  {
    id: 'thor-57',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '6mo',
    content: 'Stop adding features to improve retention. Start removing friction.\n\nMost users leave because your product is confusing, not because it\'s missing features.',
    likes: 6234,
    comments: 489,
  },
  {
    id: 'thor-58',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '6mo',
    content: 'Your product\'s success is measured in outcomes, not outputs.\n\nShipping features is easy. Creating value is hard.',
    likes: 5432,
    comments: 423,
  },
  {
    id: 'thor-59',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '6mo',
    content: 'Product managers are professional translators:\n\n• Translate business goals into product specs\n• Translate user needs into features\n• Translate engineering constraints into roadmaps\n\nLose something in translation? You fail.',
    likes: 7654,
    comments: 578,
  },
  {
    id: 'thor-60',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '6mo',
    content: 'The most dangerous phrase in product management: "But our competitors have it."\n\nYour competitors might be wrong. Build what YOUR users need.',
    likes: 5892,
    comments: 467,
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop',
  },
  {
    id: 'thor-61',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '6mo',
    content: 'Unpopular opinion: Most product vision documents are fiction.\n\nYour actual vision is what you ship, not what you write in Notion.',
    likes: 6543,
    comments: 534,
  },
  {
    id: 'thor-62',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '7mo',
    content: 'Three types of product managers:\n\n1. Feature factories (build what they\'re told)\n2. Feature advocates (build what users ask for)\n3. Problem solvers (build what users need)\n\nBe #3.',
    likes: 8234,
    comments: 645,
  },
  {
    id: 'thor-63',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '7mo',
    content: 'The product decisions that keep me up at night aren\'t the ones we made. They\'re the ones we didn\'t make fast enough.',
    likes: 4567,
    comments: 378,
  },
  {
    id: 'thor-64',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '7mo',
    content: 'Your product doesn\'t fail because of bad execution. It fails because you built something nobody wants.\n\nValidate the problem before you build the solution.',
    likes: 7234,
    comments: 589,
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop',
  },
  {
    id: 'thor-65',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '7mo',
    content: 'The best product feedback I ever got: "This is so simple my grandma could use it."\n\nComplexity is not a feature. It\'s a bug.',
    likes: 5892,
    comments: 467,
  },
  {
    id: 'thor-66',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '7mo',
    content: 'You know you\'re doing product management right when:\n\n• Engineering respects your decisions\n• Sales trusts your roadmap\n• Users love your product\n• Everyone is slightly annoyed with you',
    likes: 6789,
    comments: 523,
  },
  {
    id: 'thor-67',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '8mo',
    content: 'I don\'t have a product management certification. I have 1000 mistakes and the humility to learn from them.\n\nThat\'s the only credential that matters.',
    likes: 5432,
    comments: 445,
  },
  {
    id: 'thor-68',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '8mo',
    content: 'Your users don\'t want your product. They want the outcome your product enables.\n\nSell the transformation, not the features.',
    likes: 7654,
    comments: 612,
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop',
  },
  {
    id: 'thor-69',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '8mo',
    content: 'Product strategy in one sentence: Do less, better.',
    likes: 4892,
    comments: 378,
  },
  {
    id: 'thor-70',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '8mo',
    content: 'The hardest conversations in product management:\n\n1. Telling the CEO their idea won\'t work\n2. Sunsetting a feature people love\n3. Admitting you were wrong\n\nAll three are necessary.',
    likes: 6234,
    comments: 512,
  },
  {
    id: 'thor-71',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '8mo',
    content: 'Most product pivots happen because someone finally had the courage to admit the obvious:\n\nThis isn\'t working.',
    likes: 5678,
    comments: 467,
  },
  {
    id: 'thor-72',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '9mo',
    content: 'The best product managers are part psychologist, part economist, part designer, part engineer.\n\nAnd 100% comfortable with ambiguity.',
    likes: 7234,
    comments: 578,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
  },
  {
    id: 'thor-73',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '9mo',
    content: 'Your product roadmap should answer three questions:\n\n1. What are we building?\n2. Why does it matter?\n3. How will we know it worked?\n\nIf you can\'t answer all three, keep planning.',
    likes: 6543,
    comments: 523,
  },
  {
    id: 'thor-74',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '9mo',
    content: 'I used to think my job was to have all the answers. Now I know it\'s to ask the right questions.',
    likes: 5234,
    comments: 434,
  },
  {
    id: 'thor-75',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '9mo',
    content: 'Technical debt is like credit card debt. A little is fine. A lot will destroy you.\n\nPay it down regularly or pay the price later.',
    likes: 4892,
    comments: 389,
  },
  {
    id: 'thor-76',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '10mo',
    content: 'Your first version doesn\'t need:\n\n• Perfect design\n• Scalable infrastructure\n• Every feature you dreamed of\n\nIt needs ONE thing: Proof that someone will use it.',
    likes: 8765,
    comments: 678,
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop',
  },
  {
    id: 'thor-77',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '10mo',
    content: 'The best product decisions are reversible. The worst ones aren\'t.\n\nKnow the difference before you decide.',
    likes: 6234,
    comments: 489,
  },
  {
    id: 'thor-78',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '10mo',
    content: 'Product management is 20% building products and 80% managing expectations.\n\nGet good at the 80%.',
    likes: 7654,
    comments: 612,
  },
  {
    id: 'thor-79',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '10mo',
    content: 'Stop calling everything a "priority." If everything is a priority, nothing is.',
    likes: 5892,
    comments: 467,
  },
  {
    id: 'thor-80',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '11mo',
    content: 'The best products solve one problem extremely well.\n\nThe worst products solve every problem poorly.\n\nChoose focus over breadth.',
    likes: 6789,
    comments: 534,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
  },
  {
    id: 'thor-81',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '11mo',
    content: 'Product managers don\'t ship features. They ship outcomes.\n\nRemember the difference.',
    likes: 5432,
    comments: 423,
  },
  {
    id: 'thor-82',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '11mo',
    content: 'Your biggest risk isn\'t building the wrong thing. It\'s building the right thing at the wrong time.\n\nTiming beats perfection.',
    likes: 7234,
    comments: 578,
  },
  {
    id: 'thor-83',
    author: 'Thor Odinson',
    role: 'Senior Product Manager at GSOBA',
    timeAgo: '1y',
    content: '127 posts later, here\'s what I\'ve learned about product management:\n\nTalk to users. Ship fast. Measure everything. Admit mistakes. Stay humble.\n\nThat\'s it. That\'s the job.',
    likes: 12456,
    comments: 892,
    image: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=600&h=400&fit=crop',
  },
];

const SAVED_POSTS: Post[] = [
  {
    id: '1',
    author: 'Sarah Johnson',
    role: 'CEO at StartupHub',
    timeAgo: '2h',
    content: 'Just hit a major milestone! After 6 months of consistent effort, we\'ve grown our team by 300%. Here\'s what we learned along the way: 1) Trust your process 2) Invest in people 3) Stay adaptable',
    likes: 342,
    comments: 28,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
  },
  {
    id: '2',
    author: 'Michael Chen',
    role: 'Software Engineer at Microsoft',
    timeAgo: '5h',
    content: '5 strategies that helped us scale from $0 to $1M ARR:\n\n1) Focus on customer success\n2) Build in public\n3) Iterate quickly\n4) Listen to feedback\n5) Stay consistent',
    likes: 521,
    comments: 64,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
  },
  {
    id: '3',
    author: 'Emma Rodriguez',
    role: 'Data Scientist at Google',
    timeAgo: '1d',
    content: 'The future of work is here. Remote teams are outperforming traditional offices by 25%. Here\'s why flexibility is the key to productivity...',
    likes: 198,
    comments: 15,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop',
  },
  {
    id: '4',
    author: 'David Kim',
    role: 'UX Designer at Adobe',
    timeAgo: '2d',
    content: 'Your network is your net worth. Start building meaningful connections today. Quality over quantity always wins. 🚀',
    likes: 876,
    comments: 42,
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=400&fit=crop',
  },
  {
    id: '5',
    author: 'Jennifer Martinez',
    role: 'Product Manager at Salesforce',
    timeAgo: '3d',
    content: 'Excited to share our latest product launch! After months of development, we\'re finally ready to help businesses transform their digital presence.',
    likes: 234,
    comments: 19,
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop',
  },
];

interface PostLibraryProps {
  onImportPost: (post: Post) => void;
}

export default function PostLibrary({ onImportPost }: PostLibraryProps) {
  const [selectedSection, setSelectedSection] = useState<'your' | 'saved'>('your');

  const postsToShow = selectedSection === 'your' ? YOUR_POSTS : SAVED_POSTS;

  return (
    <div className="space-y-3 min-w-0">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-linkedin overflow-hidden">
        <div className="px-4 py-3 border-b border-linkedin-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-linkedin-gray-900">Posts</h3>
          <span className="text-xs text-linkedin-gray-600">{127}</span>
        </div>

        {/* Section Toggle */}
        <div className="px-4 border-b border-linkedin-gray-200">
          <div className="flex gap-6">
            <button
              onClick={() => setSelectedSection('your')}
              className={`relative px-1 py-3 text-xs font-semibold transition-colors ${
                selectedSection === 'your'
                  ? 'text-linkedin-gray-900'
                  : 'text-linkedin-gray-600 hover:text-linkedin-gray-900'
              }`}
            >
              Your Posts
              {selectedSection === 'your' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linkedin-blue rounded-full" />
              )}
            </button>
            <button
              onClick={() => setSelectedSection('saved')}
              className={`relative px-1 py-3 text-xs font-semibold transition-colors ${
                selectedSection === 'saved'
                  ? 'text-linkedin-gray-900'
                  : 'text-linkedin-gray-600 hover:text-linkedin-gray-900'
              }`}
            >
              Saved
              {selectedSection === 'saved' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linkedin-blue rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Posts List */}
        <div className="max-h-[500px] overflow-y-auto overflow-x-hidden p-3 space-y-3">
          {postsToShow.map((post) => (
            <LinkedInPost key={post.id} post={post} onImport={onImportPost} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface LinkedInPostProps {
  post: Post;
  onImport: (post: Post) => void;
}

function LinkedInPost({ post, onImport }: LinkedInPostProps) {
  const getProfileImage = (authorId: string) => {
    // All Thor posts use the same profile picture
    if (authorId.startsWith('thor-')) {
      return 'https://i.pravatar.cc/150?img=12';
    }

    // Saved posts from other people
    const imageMap: Record<string, string> = {
      '1': 'https://i.pravatar.cc/150?img=47',
      '2': 'https://i.pravatar.cc/150?img=13',
      '3': 'https://i.pravatar.cc/150?img=32',
      '4': 'https://i.pravatar.cc/150?img=15',
      '5': 'https://i.pravatar.cc/150?img=45',
    };
    return imageMap[authorId] || 'https://i.pravatar.cc/150?img=1';
  };

  return (
    <div className="bg-white rounded-xl border border-linkedin-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden">
      <div
        className="p-3"
        onClick={(e) => {
          // Only open URL if clicking on the post content, not on the "Send to Script Writer" button
          if (post.url && !(e.target as HTMLElement).closest('button')) {
            window.open(post.url, '_blank', 'noopener,noreferrer');
          }
        }}
      >
      {/* Post Header */}
      <div className="flex items-start gap-2.5 mb-2">
        <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden bg-linkedin-gray-200 ring-2 ring-white shadow-sm">
          <img
            src={getProfileImage(post.id)}
            alt={post.author}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-linkedin-gray-900 group-hover:text-linkedin-blue transition-colors">
            {post.author}
          </h4>
          <p className="text-[10px] text-linkedin-gray-600 truncate">{post.role}</p>
          <p className="text-[10px] text-linkedin-gray-500">{post.timeAgo} ago</p>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-2.5">
        <p className="text-xs text-linkedin-gray-900 leading-relaxed line-clamp-3">
          {post.content}
        </p>
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="mb-2.5 -mx-3 overflow-hidden">
          <img
            src={post.image}
            alt="Post content"
            className="w-full h-28 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </div>
      )}

      {/* Engagement Stats */}
      <div className="flex items-center justify-between py-1.5 mb-2">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            <div className="w-4 h-4 rounded-full bg-linkedin-blue flex items-center justify-center border border-white">
              <ThumbsUp className="w-2 h-2 fill-white text-white" />
            </div>
            <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center border border-white">
              <span className="text-[9px]">❤️</span>
            </div>
            <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center border border-white">
              <span className="text-[9px]">👏</span>
            </div>
          </div>
          <span className="text-[10px] text-linkedin-gray-600">{post.likes.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-linkedin-gray-600">
          <MessageSquare className="w-3 h-3" />
          <span>{post.comments}</span>
        </div>
      </div>

      {/* Use Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onImport(post);
        }}
        className="w-full flex items-center justify-center gap-1.5 py-2 bg-linkedin-blue hover:bg-linkedin-blue-dark text-white text-xs font-semibold rounded-lg transition-all duration-200"
      >
        <span>Send to Script Writer</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
      </div>
    </div>
  );
}
