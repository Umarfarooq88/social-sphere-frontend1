"use client"
import React, { useState } from "react";
import FileInput from "@/components/create/FileInput";
import { Button } from "@/components/ui/button";
import {google} from "googleapis";
import { OAuth2Client } from "google-auth-library";
import fs from 'fs';
import readline from "readline"




// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];
const TOKEN_PATH = 'token.json ';

// Load client secrets from a local file.
fs.readFile('client_secrets.json', (err, content:any) => {
  if (err) {
    return console.log('Error loading client secret file:', err);
  }
  // Authorize a client with credentials, then call the YouTube API.
  authorize(JSON.parse(content), uploadVideo);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials:any, callback:any) {
  const { client_secret, client_id, redirect_uris } = credentials;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token:any) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client:OAuth2Client, callback:any) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code:any) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token:any) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Uploads a video to YouTube.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
 function uploadVideo(auth:OAuth2Client, textareaValue:string) {
  const youtube = google.youtube({ version: 'v3', auth });
  const fileName = 'your_video.mp4'; // Specify the path to your video file
  const fileSize = fs.statSync(fileName).size;

   youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
          snippet: {
              title: 'Test Title', // Specify your video title
              description: textareaValue, // Specify your video description
              tags: ['keyword1', 'keyword2'], // Specify your video tags
              categoryId: '22', // Specify the category ID (see: https://developers.google.com/youtube/v3/docs/videoCategories/list)
          },
          status: {
              privacyStatus: 'public', // Specify your video privacy status (public, private, unlisted)
          },
      },
      media: {
          body: fs.createReadStream(fileName),
      },
  }, {
      // Use the `contentLength` option to indicate the size of the file being uploaded
      // This is required when the `chunkSize` option is set to a value other than -1
      // Set it to the size of the file being uploaded
     maxContentLength:fileSize
  }, (err: any, res: any) => {
      if (err) {
          console.error('Error uploading video:', err);
          return;
      }
      console.log('Video uploaded:', res.data);
  });
}



const Popup = () => {
  const [textareaValue, setTextareaValue] = useState('');
  const [title, setTitle] = useState('');
  const [keywords, setKeywords] = useState('');
  const [mediaFilePath, setMediaFilePath] = useState('');
  const [mediaUploaded, setMediaUploaded] = useState(false); 

  const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextareaValue(event.target.value);
  };

  const handleMediaUpload = (filePath: string) => {
    setMediaUploaded(true);
    setMediaFilePath(filePath);
  };

  const handleCreatePost = () => {
  authorize({
    "client_id": "",
    "client_secret": "",
    "redirect_uris": [],
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://accounts.google.com/o/oauth2/token"
  }, (oAuth2Client:any)=>{
    if(!oAuth2Client) return;
    uploadVideo(oAuth2Client, textareaValue)
  })
  };

  const isButtonDisabled = () => {
    return textareaValue.length === 0 || title.length === 0 || !mediaUploaded;
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-8 w-1/2 h-auto rounded-lg">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-bold">Create Post</h2>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Enter title"
            className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Start writing"
            className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-2"
            rows={10}
            value={textareaValue}
            onChange={handleTextareaChange}
          ></textarea>
          {!textareaValue && (
            <button className="absolute top-1 left-36  px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg opacity-50 hover:opacity-100">
              Use the AI Assistant
            </button>
          )}
        </div>
        <div>
          <input type="text" placeholder="Enter keywords" className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-2" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
          <FileInput onUpload={()=>handleMediaUpload}  />
        </div>
        
        {/* Bottom buttons */}
        <div className="flex justify-end p-2">
          <Button
            className="m-2 bg-blue-600"
            disabled={isButtonDisabled()} 
            onClick={handleCreatePost}
          >
            Create Post
          </Button>
          <Button
            className="m-2"
            disabled={isButtonDisabled()} 
          >
            Save Idea
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Popup;