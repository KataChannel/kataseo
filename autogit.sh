read -p "Enter branch name: " branch_name
git checkout -b "$branch_name"
git push --set-upstream origin "$branch_name"
git add .
read -p "Enter commit message: " commit_message
git commit -m "$commit_message"
git push