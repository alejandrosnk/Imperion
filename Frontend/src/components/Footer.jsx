import "../styles/footer.css";

function Footer() {
  return (
    <footer className="footer-custom mt-auto py-3">
      <div className="container d-flex justify-content-between align-items-center">
        {/* Texto izquierda */}
        <small>
          © {new Date().getFullYear()} Imperion, Inc.
        </small>

        {/* Redes sociales */}
        <div className="footer-socials d-flex gap-3">
          <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer">Twitter</a>
          <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
