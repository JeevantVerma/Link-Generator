import React, { useState } from "react";
import {
  TextField,
  Button,
  Grid,
  createTheme,
  ThemeProvider,
  Typography,
  Box,
  Snackbar,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import axios from "axios";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

const MainContentSection = () => {
  const [longUrl, setLongUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [short, setShort] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [error, setError] = useState("");

  const handleShortenUrl = async () => {
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    if (!urlRegex.test(longUrl)) {
      setError("Invalid URL");
      return;
    }
    setError("");

    const shortenedUrl = generateShortenedUrl(alias);
    setShortenedUrl(shortenedUrl);

    // api call to add link in the backend
    const raw = JSON.stringify({
      Link: longUrl,
      ShortURL: short,
      Expiry: "",
    });
    const config = {
      method: "POST",
      maxBodyLength: Infinity,
      url: "https://l.mlsctiet.com/add-link",
      headers: {
        "Content-Type": "application/json",
      },
      data: raw,
    };
    const response = await axios.request(config);
    // show the response from the backend with this
    console.log(response);
  };

  const generateRandomAlias = () => {
    const length = 6;
    const characters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomString = "";
    for (let i = 0; i < length; i++) {
      randomString += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return randomString;
  };

  const generateShortenedUrl = (alias) => {
    let shortenedUrl = "https://l.mlsctiet.com/";
    if (alias.trim() !== "") {
      setShort(alias);
      shortenedUrl += alias;
    } else {
      const s = generateRandomAlias();
      shortenedUrl += s;
      setShort(s);
    }
    return shortenedUrl;
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(shortenedUrl)
      .then(() => {
        console.log("URL copied to clipboard");
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error("Failed to copy URL to clipboard:", error);
      });
  };

  return (
    <Grid
      container
      spacing={2}
      alignItems="center"
      sx={{ backgroundColor: "#eaeff1", padding: 5, borderRadius: 10 }}
    >
      <Typography variant="h4">Shorten Your link</Typography>

      <Grid item xs={12}>
        <TextField
          label="Enter your long URL"
          variant="outlined"
          fullWidth
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          required
          error={!!error}
          helperText={error}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Enter custom alias (optional)"
          variant="outlined"
          fullWidth
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
        />
      </Grid>
      <Grid item xs={12}>
        <Button variant="contained" color="primary" onClick={handleShortenUrl}>
          Shorten URL
        </Button>
      </Grid>
      {shortenedUrl && (
        <Grid item xs={12}>
          <Typography variant="body6">Shortened URL: {shortenedUrl}</Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={copyToClipboard}
            sx={{ marginLeft: 2 }}
          >
            <ContentCopyIcon />
          </Button>
        </Grid>
      )}
      {/* Snackbar Component */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000} // Hide after 3 seconds
        onClose={() => setSnackbarOpen(false)} // Close Snackbar
        message="Successfully copied Link" // Snackbar message
      />
    </Grid>
  );
};

export default MainContentSection;
