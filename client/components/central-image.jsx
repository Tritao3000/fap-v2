'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

import Todos from '@/public/fap_branco.png';

const CentralImage = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <Image src={Todos} alt="Belt Logo" width={150} className="w-16 md:w-20" />
      <div className="max-w-sm md:max-w-md text-center opacity-50">
        <p className="text-sm md:text-base whitespace-normal sm:whitespace-nowrap">
          Veja todas as suas questões <strong>FAP</strong> respondidas em
          segundos
        </p>
      </div>
    </div>
  );
};

export default CentralImage;
