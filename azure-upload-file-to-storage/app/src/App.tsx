import { BlockBlobClient } from '@azure/storage-blob';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import ErrorBoundary from './components/error-boundary';
import { convertFileToArrayBuffer } from './lib/convert-file-to-arraybuffer';
import './App.css';

const API_SERVER = "https://blue-ground-006b3d61e.6.azurestaticapps.net";

type SasResponse = { url: string };

function App() {
  const containerName = `upload`;
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setSelectedFiles(files);
    setUploadStatus('');
  };

  const handleUploadCombined = async () => {
    if (!selectedFiles.length) return;
    setLoading(true);
    let statuses = '';
    const permission = 'w';
    const timerange = 5;
    for (const file of selectedFiles) {
      const sasUrlEndpoint = `${API_SERVER}/api/sas?file=${encodeURIComponent(file.name)}&permission=${permission}&container=${containerName}&timerange=${timerange}`;
      try {
        const response = await fetch(sasUrlEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }});
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        const data: SasResponse = await response.json();
        const fileArrayBuffer = await convertFileToArrayBuffer(file);
        const blockBlobClient = new BlockBlobClient(data.url);
        await blockBlobClient.uploadData(fileArrayBuffer);
        statuses += `${file.name}: Uploaded successfully.\n`;
      } catch (error) {
        statuses += `${file.name}: Failed: ${error instanceof Error ? error.message : String(error)}\n`;
      }
    }
    setUploadStatus(statuses);
    setLoading(false);
  };

  return (
    <ErrorBoundary>
      <Box m={4}>
        <Typography variant="h4" gutterBottom>Upload file to Azure Storage</Typography>
        <Typography variant="h5" gutterBottom>with SAS token</Typography>
        <Typography variant="body1" gutterBottom><b>Container: {containerName}</b></Typography>
        <Box my={4}>
          <Button variant="contained" component="label">
            Select Files
            <input type="file" multiple hidden onChange={handleFileSelection} />
          </Button>
          {selectedFiles.length > 0 && (
            <Box my={2}>
              {selectedFiles.map(file => (
                <Typography variant="body2" key={file.name}>{file.name}</Typography>
              ))}
            </Box>
          )}
        </Box>
        {selectedFiles.length > 0 && (
          <Box my={4} display="flex" alignItems="center">
            <Button variant="contained" onClick={handleUploadCombined} disabled={loading}>
              Upload
            </Button>
            {loading && (
              <Box ml={2}>
                <CircularProgress size={24} />
              </Box>
            )}
          </Box>
        )}
        {uploadStatus && (
          <Box my={2}>
            <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>{uploadStatus}</Typography>
          </Box>
        )}
      </Box>
    </ErrorBoundary>
  );
}

export default App;
