'use client';

import { motion } from 'framer-motion';

export default function ListingsPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">All Listings</h2>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        {/* Add your listing items here */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          className="bg-card p-4 rounded-xl shadow-md"
        >
          <div className="aspect-square bg-muted rounded-lg mb-2"></div>
          <h3 className="font-medium">Sample Listing</h3>
          <p className="text-sm text-gray-600">MWK 10,000</p>
        </motion.div>
      </motion.div>
    </section>
  );
} 