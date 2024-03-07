import Image from 'next/image'
import { Inter } from 'next/font/google'
import 'chart.js/auto';
import { Bar } from 'react-chartjs-2'
import { useEffect, useState } from 'react';
const inter = Inter({ subsets: ['latin'] })


export default function Home() {


  const gasPerBlob = BigInt(2 ** 17);
  const targetBlobGas = gasPerBlob * BigInt(3);
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
  const blockCount = 31;

  const pricesGraphDataTemplate = {
    labels: [],
    tooltipText: [],
    datasets: [
      {
        label: "Blob price",
        backgroundColor: "rgba(255,99,132,0.2)",
        borderColor: "rgba(255,99,132,1)",
        borderWidth: 2,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        data: []
      }
    ]
  }

  let [graphData, setGraphData] = useState(pricesGraphDataTemplate);

  const blobsGraphDataTemplate = {
    labels: [],
    datasets: [
      {
        scales: {
          y: {
            suggestedMin: 6,
            suggestedMax: 6
          }
        },
        label: "Blob count",
        backgroundColor: "rgba(255,99,132,0.2)",
        borderColor: "rgba(255,99,132,1)",
        borderWidth: 2,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        data: []
      }
    ]
  }

  let [graphBlobsData, setGraphBlobsData] = useState(blobsGraphDataTemplate);

  const setData = (title: string, blobs: number[], maxBlobGasPrice?: bigint) => {
    let data = blobs.reduce((acc: any, val) => {
      const price = calcBlobGasPrice(BigInt(acc.excessBlobGas));
      const blobCount = BigInt(maxBlobGasPrice && maxBlobGasPrice < price ? 0 : val);
      const excessBlobGas = acc.excessBlobGas + gasPerBlob * blobCount - targetBlobGas;
      return { prices: [...acc.prices, price], blobs: [...acc.blobs, blobCount], excessBlobGas: excessBlobGas > 0 ? excessBlobGas : BigInt(0) }
    },
      { prices: [], blobs: [], excessBlobGas: BigInt(0) }
    );
    let priceLabels = blobs.map((b, i) => `${data.prices[i]}`);
    let priceTips = blobs.map((b, i) => `${b.toString()} blobs\n ${data.prices[i]}/B\n ${data.prices[i] * gasPerBlob}/blob`);
    let blobLabels = blobs.map(b => b.toString());
    setGraphData({
      ...pricesGraphDataTemplate,
      labels: priceLabels as any,
      tooltipText: priceTips as any,
      datasets: [{ ...graphData.datasets[0], label: title, data: data.prices.map(Number) }]
    });
    setGraphBlobsData({
      ...blobsGraphDataTemplate,
      labels: blobLabels as any,
      datasets: [{ ...graphBlobsData.datasets[0], data: data.blobs.map(Number) }]
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

  useEffect(() => {
    setData("Max blobs", Array.from(Array(blockCount).keys()).map(x=>6));
  }, []);

  let [blobGasPrice, setBlobGasPrice] = useState(BigInt(BigInt(calcBlobGasPrice(BigInt(0)))));

  const mapStringToBigInt = (str: string) => {
    str = str.trim().toLowerCase();
    return BigInt(Number.parseInt(str, str.startsWith("0x") ? 16: 10) || 0);
  }

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div>
        <h1>EIP-4844: Shard Blob Transactions, visually explained</h1>
        <br />
        <h2>Blob gas price per unit depending on blob count per block</h2>

        <div className="chart-container">
          <Bar data={graphData} options={options} />
        </div>
        <div className="blobs-chart-container">
          <Bar data={graphBlobsData} options={options} />
        </div>
        <br />

        Strategies:<br/><br/>
        <div className="bg-gray-500 hover:bg-blue-700 text-white font-bold py-2 px-12 rounded w-80" onClick={() => setData("Target blobs", Array.from(Array(blockCount).keys()).map(x => 3))}>Target blobs</div><br/>
        <div className="bg-gray-500 hover:bg-blue-700 text-white font-bold py-2 px-12 rounded w-80" onClick={() => setData("Max blobs", Array.from(Array(blockCount).keys()).map(x => 6))}>Max blobs</div><br/>
        <div className="bg-gray-500 hover:bg-blue-700 text-white font-bold py-2 px-12 rounded w-80" onClick={() => setData("Limit maxBlobGasPrice, 20/B", Array.from(Array(blockCount).keys()).map(x => 6), BigInt(20))}>Limit maxBlobGasPrice</div>
        {/* <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded pb-4" onClick={() => setData(Array.from(Array(blockCount).keys()).map(x=>6))}>Emulate several senders</button> */}
      </div>

      <div>
        <h2>Gas price calculator</h2>
        <br />
        <input type="text" className="bg-blue-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          onChange={(value)=>setBlobGasPrice(calcBlobGasPrice(mapStringToBigInt(value.target.value)))} /> 
        <div>Blob gas price: <span>{blobGasPrice.toString()}</span> ( <span>0x{blobGasPrice.toString(16)}</span> )</div>

      </div>
    </main>
  )
}
