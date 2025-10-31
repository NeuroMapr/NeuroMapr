# Pre-Push CI Checklist

Run these checks locally before pushing to avoid CI failures:

## ✅ Quick Checks (2 minutes)

```bash
cd backend

# 1. Check syntax
npm run check:all

# 2. Security audit
npm run audit

# 3. Test connections (if Vultr is configured)
npm run test:connections
```

---

## 📋 Manual Checks

### Code Quality
- [ ] No `console.log` in production code (routes/services)
- [ ] No TODO/FIXME comments (or documented in issues)
- [ ] No large files (> 1MB)
- [ ] Code is properly formatted

### Security
- [ ] No API keys or secrets in code
- [ ] `.env` file not committed
- [ ] No passwords in comments
- [ ] Dependencies are up to date

### Documentation
- [ ] API_DOCUMENTATION.md updated (if API changed)
- [ ] INTEGRATION_GUIDE.md updated (if integration changed)
- [ ] Comments added for complex logic
- [ ] README updated (if setup changed)

### Files
- [ ] All imports resolve correctly
- [ ] No unused dependencies
- [ ] package.json and package-lock.json in sync
- [ ] .env.example updated (if new env vars added)

---

## 🚀 Before Creating PR

### PR Preparation
- [ ] Branch is up to date with main/develop
- [ ] No merge conflicts
- [ ] Commits are clean and descriptive
- [ ] PR title follows format: `type(scope): description`

### Testing
- [ ] Tested locally with `npm run dev`
- [ ] All endpoints work as expected
- [ ] Error handling tested
- [ ] Rate limiting tested (if applicable)

### Review
- [ ] Self-reviewed all changes
- [ ] Removed debug code
- [ ] Removed commented-out code
- [ ] Code follows project conventions

---

## 🎯 CI Will Check

When you push, GitHub Actions will automatically check:

✅ **Syntax** - All JavaScript files are valid  
✅ **Dependencies** - No missing packages  
✅ **Security** - No vulnerabilities or secrets  
✅ **Code Quality** - No obvious issues  
✅ **Build** - All imports resolve  
✅ **Documentation** - Required docs exist  
✅ **PR Format** - Title and description are valid  

---

## ⚡ Quick Commands

```bash
# Check everything at once
npm run check:all && npm audit && echo "✅ All checks passed!"

# Fix common issues
npm audit fix              # Fix security issues
npm install                # Sync dependencies
git pull origin main       # Update branch

# Test locally
npm run dev                # Start server
curl http://localhost:5000/health  # Test endpoint
```

---

## 🐛 Common Issues

### "Cannot find module"
```bash
npm install
```

### "Syntax error"
```bash
node --check src/path/to/file.js
```

### "Security vulnerabilities"
```bash
npm audit fix
```

### ".env committed"
```bash
git rm --cached backend/.env
echo "backend/.env" >> .gitignore
```

---

## 📞 Need Help?

If checks fail:
1. Read the error message carefully
2. Run the failing check locally
3. Check `.github/CI_SETUP.md` for details
4. Ask team for help

---

**Remember:** CI is here to help catch issues early. Run checks locally to save time! ⚡
