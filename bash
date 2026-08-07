git clone https://github.com/DSangHub/lowi-price.git
cd lowi-price

grep -rl "LowisPice" --include="*.jsx" --include="*.html" . \
  | while IFS= read -r file; do
      sed -i '' 's/LowisPice/LowisPrice/g' "$file"
    done

git add -A
git commit -m "Fix brand name: LowisPice -> LowisPrice"
git push
