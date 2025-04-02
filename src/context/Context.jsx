import { createContext, useState, useEffect } from "react";
import { run } from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");
    const [error, setError] = useState(null);

    const delayPara = (index, nextWord) => {
        setTimeout(function(){
            setResultData(prev => prev + nextWord);
        }, index * 75);
    }

    const onSent = async(prompt) => {
        if (!input.trim() && !prompt) return;
        
        setLoading(true);
        setResultData("");
        setError(null);
        
        try {
            let response;
            if (prompt !== undefined) {
                response = await run(prompt);
                setRecentPrompt(prompt);
            } else {
                setPrevPrompts(prev => [...prev, input]);
                setRecentPrompt(input);
                response = await run(input);
            }
            
            if (response.includes("You've reached the daily limit") || 
                response.includes("Sorry, I encountered an error")) {
                setResultData(response);
                setLoading(false);
                setShowResult(true);
                setInput("");
                return;
            }
            
            let responseArray = response.split(" ");
            let newResponse = "";
            
            for(let i = 0; i < responseArray.length; i++){
                if(i === 0 || i % 2 !== 1){
                    newResponse += responseArray[i] + " ";
                }
                else{
                    newResponse += "**" + responseArray[i] + "** ";
                }
            }
            
            let newResponse2 = newResponse.split("*").join("\n");
            let newResponseArray = newResponse2.split(" ");
            
            for(let i = 0; i < newResponseArray.length; i++){
                const nextWord = newResponseArray[i];
                delayPara(i, nextWord + " ");
            }
        } catch (err) {
            setError("An error occurred while processing your request.");
            setResultData("Something went wrong. Please try again later.");
        } finally {
            setLoading(false);
            setShowResult(true);
            setInput("");
        }
    }

    const newChat = () => {
        setLoading(false);
        setShowResult(false);
        setResultData("");
        setRecentPrompt("");
        setError(null);
    }
    
    const contextValue = {
        onSent,
        prevPrompts,
        setPrevPrompts,
        recentPrompt,
        setRecentPrompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        newChat,
        error,
    }

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    )
}

export default ContextProvider