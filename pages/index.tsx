import Image from 'next/image'
import { Inter } from 'next/font/google'
import 'chart.js/auto';
import { Bar } from 'react-chartjs-2'
import { useState } from 'react';
const inter = Inter({ subsets: ['latin'] })


export default function Home() {


  const gasPerBlob = BigInt(2 ** 17);
  const blobGasPriceUpdateFraction = BigInt(3338477);

  const calcBlobGasPrice = (excessBlobGas: bigint) => {
    // ethereumjs pieces
    const BIGINT_0 = BigInt(0);
    const BIGINT_1 = BigInt(1);
    const fakeExponential = (factor: bigint, numerator: bigint, denominator: bigint) => {
      let i = BIGINT_1;
      let output = BIGINT_0;
      let numerator_accum = factor * denominator;
      while (numerator_accum > BIGINT_0) {
        output += numerator_accum;
        numerator_accum = (numerator_accum * numerator) / (denominator * i);
        i++;
      }

      return output / denominator;
    };

    return fakeExponential(BigInt(1), excessBlobGas, blobGasPriceUpdateFraction);
  };
  const n = 30;


  let [graphData, setGraphData] = useState({
    labels: Array.from(Array(n).keys()),
    datasets: [
      {
        label: "Blob price",
        backgroundColor: "rgba(255,99,132,0.2)",
        borderColor: "rgba(255,99,132,1)",
        borderWidth: 2,

        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        data: Array.from(Array(n).keys()).map((i) =>
          Number(calcBlobGasPrice(BigInt(i * 3) * gasPerBlob))
        )
      }
    ]
  });

  const setData = (data: number[]) => {
    setGraphData({
      ...graphData,
      labels: Array.from(Array(data.length).keys()),
      datasets: [{ ...graphData.datasets[0], data: data }]
    });
  }

  const options = {
    maintainAspectRatio: false,
    scales: {
      y: {
        stacked: true,
        grid: {
          display: true,
          color: "rgba(255,99,132,0.2)"
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };


  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div>
        <h1>EIP-4844: Shard Blob Transactions, visually explained</h1>
        <div className="chart-container">
          <Bar data={graphData} options={options} />
        </div>

        Strategies:

        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setData(Array.from(Array(n).keys()).map((i) =>
          Number(calcBlobGasPrice(BigInt(0) * gasPerBlob))
        ))}>Target blobs</button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setData(Array.from(Array(n).keys()).map((i) =>
          Number(calcBlobGasPrice(BigInt(i * 3) * gasPerBlob))
        ))}>Max blobs</button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setData(Array.from(Array(n).keys()).map((i) =>
          Number(calcBlobGasPrice(BigInt(Math.min(i * 3, 42)) * gasPerBlob))
        ))}>Limit maxBlobGasPrice</button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setData(Array.from(Array(n).keys()).map((i) =>
          Number(calcBlobGasPrice(BigInt(i * 3) * gasPerBlob))
        ))}>Emulate several senders</button>
      </div>
    </main>
  )
}
