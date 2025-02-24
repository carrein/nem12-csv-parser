import { createGlobalStyle } from "styled-components";
import Iosevka from "../fonts/Iosevka.ttf";

export const GlobalStyles = createGlobalStyle`
  @font-face {
    font-family: "Iosevka";
    src: url(${Iosevka}) format('truetype'); /* Specify the format */
    font-weight: normal; /* Optional: specify the font weight */
    font-style: normal; /* Optional: specify the font style */
  }

  html,
  body {
    padding: 0;
    margin: 0;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  * {
    font-family: "Iosevka", sans-serif;
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
  }
`;
