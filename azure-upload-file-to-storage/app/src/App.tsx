import { BlockBlobClient } from '@azure/storage-blob';
import { Box, Button, Card, CardMedia, Grid, Typography } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import ErrorBoundary from './components/error-boundary';
import { convertFileToArrayBuffer } from './lib/convert-file-to-arraybuffer';
import './App.css';

const API_SERVER = "https://blue-ground-006b3d61e.6.azurestaticapps.net";

type SasResponse = { url: string };
type ListResponse = { list: string[] };

function App() {
  const containerName = `upload`;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [list, setList] = useState<string[]>([]);

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadStatus('');
  };

  const handleUploadCombined = () => {
    if (!selectedFile) return;
    const permission = 'w';
    const timerange = 5;
    const sasUrlEndpoint = `${API_SERVER}/api/sas?file=${encodeURIComponent(selectedFile.name)}&permission=${permission}&container=${containerName}&timerange=${timerange}`;

    fetch(sasUrlEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }})
      .then(response => {
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return response.json();
      })
      .then((data: SasResponse) => {
        return convertFileToArrayBuffer(selectedFile).then((fileArrayBuffer) => {
          const blockBlobClient = new BlockBlobClient(data.url);
          return blockBlobClient.uploadData(fileArrayBuffer);
        });
      })
      .then(() => {
        setUploadStatus('Successfully finished upload');
        return fetch(`${API_SERVER}/api/list?container=${containerName}`);
      })
      .then(response => {
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return response.json();
      })
      .then((data: ListResponse) => setList(data.list))
      .catch(error => setUploadStatus(`Failed: ${error instanceof Error ? error.message : String(error)}`));
  };

  return (
    <ErrorBoundary>
      <Box m={4}>
        <Typography variant="h4" gutterBottom>Upload file to Azure Storage</Typography>
        <Typography variant="h5" gutterBottom>with SAS token</Typography>
        <Typography variant="body1" gutterBottom><b>Container: {containerName}</b></Typography>
        <Box my={4}>
          <Button variant="contained" component="label">
            Select File
            <input type="file" hidden onChange={handleFileSelection} />
          </Button>
          {selectedFile && <Box my={2}><Typography variant="body2">{selectedFile.name}</Typography></Box>}
        </Box>
        {selectedFile && (
          <Box my={4}>
            <Button variant="contained" onClick={handleUploadCombined}>Upload</Button>
            {uploadStatus && <Box my={2}><Typography variant="body2">{uploadStatus}</Typography></Box>}
          </Box>
        )}
        <Grid container spacing={2}>
          {list.map(item => (
            <Grid item xs={6} sm={4} md={3} key={item}>
              <Card>
                {/\.(jpg|png|jpeg|gif)$/.test(item) ? (
                  <CardMedia component="img" image={item} alt={item} />
                ) : (
                  <Typography variant="body1" gutterBottom>{item}</Typography>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </ErrorBoundary>
  );
}

export default App;
