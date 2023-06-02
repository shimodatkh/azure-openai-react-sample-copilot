import React, { useState } from 'react';
import axios from 'axios';

import { PageLayout } from './components/PageLayout';
import { loginRequest } from './authConfig';
import { callMsGraph } from './graph';
import { ProfileData } from './components/ProfileData';

import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';

import './App.css';

import Button from 'react-bootstrap/Button';

const ProfileContent = () => {
    const { instance, accounts } = useMsal();
    const [graphData, setGraphData] = useState(null);
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');

    function RequestProfileData() {
        // Silently acquires an access token which is then attached to a request for MS Graph data
        instance
            .acquireTokenSilent({
                ...loginRequest,
                account: accounts[0],
            })
            .then((response) => {
                callMsGraph(response.accessToken).then((response) => setGraphData(response));
            });
    }

    async function handleInputChange(event) {
        const value = event.target.value;
        setInputText(value);

        try {
            const response = await axios.post(
                process.env.REACT_APP_OPENAI_API_URL,
                {
                    messages: [
                      {
                        role: "system",
                        content: "You are a helpful assistant."
                      },
                      {
                        role: "user",
                        content: value
                      }
                    ],
                },
                {
                  headers: {
                    "Content-Type": "application/json",
                    "api-key": process.env.REACT_APP_OPENAI_API_KEY,
                  },
                }
            );
            setOutputText(response.data.choices[0].message.content);
        } catch (error) {
            console.error(error);
        }
    }

    function handleButtonClick() {
        setOutputText(inputText);
    }

    return (
        <>
            <h5 className="card-title">Welcome {accounts[0].name}</h5>
            <br />
            {graphData ? (
                <ProfileData graphData={graphData} />
            ) : (
                <>
                    <div>
                        <input type="text" value={inputText} onChange={handleInputChange} />
                        <Button variant="secondary" onClick={handleButtonClick}>
                            Submit
                        </Button>
                    </div>
                    <br />
                    <div>
                        <textarea value={outputText} readOnly />
                    </div>
                </>
            )}
        </>
    );
};

const MainContent = () => {
    return (
        <div className="App">
            <AuthenticatedTemplate>
                <ProfileContent />
            </AuthenticatedTemplate>

            <UnauthenticatedTemplate>
                <h5>
                    <center>Please sign-in to see your profile information.</center>
                </h5>
            </UnauthenticatedTemplate>
        </div>
    );
};

export default function App() {
    return (
        <PageLayout>
            <center>
                <MainContent />
            </center>
        </PageLayout>
    );
}