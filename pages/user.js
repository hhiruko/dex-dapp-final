import { getSession, signOut } from "next-auth/react";
import Moralis from "moralis";
import { useState } from "react";
import axios from "axios";
import { useSendTransaction } from "wagmi";
import styles from '../styles/Home.module.css'

function User({ user, balance }) {
  const [fromToken, setFromToken] = useState("0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
  const [toToken, setToToken] = useState(
    "0xd6df932a45c0f255f85145f286ea0b292b21c90b"
  ); //USDC ERC20 Contract
  const [value, setValue] = useState("1000000000000000000");
  const [valueExchanged, setValueExchanged] = useState("");
  const [valueExchangedDecimals, setValueExchangedDecimals] = useState(1e18);
  const [to, setTo] = useState("");
  const [txData, setTxData] = useState("");


  const { data, isLoading, isSuccess, sendTransaction } = useSendTransaction({
      request: {
          from: user.address,
          to: String(to),
          data: String(txData),
          value: String(value),
      },
})

  function changeToToken(e){
    setToToken(e.target.value);
    setValueExchanged("");
  }

  function changeValue(e){
    setValue(e.target.value * 1E18);
    setValueExchanged("");
  }

  function changeFromToken(e){
    setFromToken(e.target.value);
    setValueExchanged("");
  }

  async function get1inchSwap(){
    const tx = await axios.get(`https://api.1inch.io/v4.0/137/swap?fromTokenAddress=${fromToken}&toTokenAddress=${toToken}&amount=${value}&fromAddress=${user.address}&slippage=5`);    
    console.log(tx.data)
    setTo(tx.data.tx.to);
    setTxData(tx.data.tx.data);
    setValueExchangedDecimals(Number(`1E${tx.data.toToken.decimals}`));
    setValueExchanged(tx.data.toTokenAmount);
  }

  return (
    <main className={styles.main} style={{ 
      backgroundImage: 'url("bg_home.jpg")'
    }}>
    <div>
      <div className={styles.walletAddress}>Your Wallet Address: {user.address}</div>
      <div className={styles.tokenBalance}>Your Selected Token Balance: {(balance.balance / 1e18).toFixed(3)}</div>
      <div className={styles.swap}>
      <select className={styles.elem1} name="fromToken" value={fromToken} onChange={(e) => changeFromToken(e)}>
        <option value="0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee">MATIC</option>
        <option value="0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619">WETH</option>
        <option value="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174">USDC</option>
        <option value="0xd6df932a45c0f255f85145f286ea0b292b21c90b">AAVE</option>
        <option value="0x9c78ee466d6cb57a4d01fd887d2b5dfb2d46288f">MUST</option>
        <option value="0xb33eaad8d922b1083446dc23f610c2567fb5180f">UNI</option>
        <option value="0xc2132d05d31c914a87c6611c10748aeb04b58e8f">USDT</option>
        <option value="0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39">LINK</option>
        <option value="0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6">WBTC</option>
      </select>
      <input className={styles.elem2}
        onChange={(e) => changeValue(e)}
        value={value / 1e18}
        type="number"
        min={0}
        max={balance.balance / 1e18}
      ></input>
      <select className={styles.elem3} name="toToken" value={toToken} onChange={(e) => changeToToken(e)}>
        <option value="0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619">WETH</option>
        <option value="0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee">MATIC</option>
        <option value="0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174">USDC</option>
        <option value="0xd6df932a45c0f255f85145f286ea0b292b21c90b">AAVE</option>
        <option value="0x9c78ee466d6cb57a4d01fd887d2b5dfb2d46288f">MUST</option>
        <option value="0xb33eaad8d922b1083446dc23f610c2567fb5180f">UNI</option>
        <option value="0xc2132d05d31c914a87c6611c10748aeb04b58e8f">USDT</option>
        <option value="0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39">LINK</option>
        <option value="0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6">WBTC</option>
      </select>
      <input className={styles.elem4}
        value={
          !valueExchanged
            ? ""
            : (valueExchanged / valueExchangedDecimals).toFixed(5)
        }
        disabled={true}
      ></input>
      <button className={styles.elem5} onClick={get1inchSwap}>Convert</button>
      <button className={styles.elem6} disabled={!valueExchanged} onClick={sendTransaction}>Swap Tokens</button>
      {isLoading && <div>Check Wallet</div>}
      {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
      <button className={styles.elem7} onClick={() => signOut({ redirect: "/signin" })}>Sign out</button>
      </div>
    </div>
    </main>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/signin",
        permanent: false,
      },
    };
  }

  await Moralis.start({ apiKey: process.env.MORALIS_API_KEY });

  const response = await Moralis.EvmApi.account.getNativeBalance({
    address: session.user.address,
    chain: 0x89,
  });

  return {
    props: { user: session.user, balance: response.raw },
  };
}

export default User;
