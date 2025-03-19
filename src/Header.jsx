import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import hypercycle from "hypercyclejs";
import { useCallback, useEffect, useState } from "react";
import Loading from "./Loading";

const nodeUrl = import.meta.env.VITE_NODE_URL;

const getNodeAddress = async () => {
    try {
        const info = await hypercycle.getNodeInfo(nodeUrl);
        return info.tm.address;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const Header = () => {
    const { address: userAddress } = useAccount();
    const [currentBalance, setCurrentBalance] = useState(0);
    const [nodeAddress, setNodeAddress] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleNodebalance = useCallback(async () => {
        if (nodeUrl && userAddress) {
            setLoading(true);
            try {
                const balance = await hypercycle.getNodeBalance(nodeUrl, userAddress);

                setCurrentBalance(Number(balance[userAddress]['USDC']) | 0);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
    }, [userAddress]);


    const handlePay = async () => {
        if (!nodeAddress) {
            console.err("Node info not found");
            return;
        }
        setLoading(true);
        try {
            const pay = await hypercycle.nodeDeposit(
                nodeUrl,
                userAddress,
                nodeAddress,
                5000000,
                "USDC",
                "Sepolia"
            );
            await handleNodebalance(import.meta.env.VITE_NODE_URL, userAddress);
            console.log(pay);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        async function fetchData() {
            const addr = await getNodeAddress();
            setNodeAddress(addr);
            await handleNodebalance();
        }
        fetchData();
        setLoading(false);
    }, [handleNodebalance]);

    return (
        <header className="flex flex-row-reverse flex-wrap gap-2 sm:flex-row justify-end px-12">
            {
                userAddress && (
                    <>
                        <div className="mr-2 py-2 text-xs sm:text-lg flex">
                            <span className="content-center">Balance : </span>
                            <span className="font-bold grid place-items-center min-w-[32px]">{
                                loading ? <Loading /> : currentBalance}
                            </span>
                        </div>
                        <button
                            className="disabled:!cursor-not-allowed mr-2 p-2 outline-none bg-slate-950 text-slate-100 font-bold rounded-xl"
                            onClick={handlePay}
                            disabled={loading}
                        >
                            Add Funds
                        </button>
                    </>
                )
            }
            <ConnectKitButton.Custom>
                {({
                    isConnected,
                    show,
                    ensName,
                    truncatedAddress,
                }) => {
                    return (
                        <button
                            type="button"
                            onClick={show}
                            className="w-fit text-xs outline-none hover:bg-slate-700 cursor-pointer transition-all duration-200  rounded-xl border border-slate-800 bg-slate-950 p-2 font-bold text-slate-100"
                        >
                            {isConnected ? ensName ?? truncatedAddress : "Connect Wallet"}
                        </button>
                    );
                }}
            </ConnectKitButton.Custom>

        </header>
    )
}
