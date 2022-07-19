//In Front-End Javascript you can't use require
//Import is best wy to do it on Frontend
import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

console.log(ethers);

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await ethereum.request({ method: "eth_requestAccounts" });
        } catch (error) {
            console.log(error);
        }
        await window.ethereum.request({ method: "eth_requestAccounts" });
        connectButton.innerHTML = "Connected!";
    } else {
        connectButton.innerHTML = "Please install Metamask!";
    }
}

async function getBalance() {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(ethers.utils.formatEther(balance));
    }
}

//Fund Function
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value;
    console.log(`Funding with ${ethAmount}...`);
    if (typeof window.ethereum !== "undefined") {
        //Need provider (connection to blockchain), signer and contract (with ABI and address)
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner(); //Returns whichever wallet is connected from the provider
        console.log(signer);
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            });
            //listen for the tx to be mined
            await listenForTransactionMined(transactionResponse, provider);
            //the function listen called will end up before the provider.once completes,
            //so the code will move on to log "Done!" cause the listener is no async function
            //due the await, front end will remember the listener and check back if it's done periodically.
            console.log("Done!");
        } catch (error) {
            console.log(error);
        }
    }
}

function listenForTransactionMined(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`);
    //Create a listener for the blockchain
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            );
            resolve();
        });
    });
}

//Withdraw Function
async function withdraw() {
    if (typeof window.ethereum != "undefined") {
        console.log("Withdrawing...");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.cheaperWithdraw();
            await listenForTransactionMined(transactionResponse, provider);
        } catch (error) {
            console.log(error);
        }
    }
}
