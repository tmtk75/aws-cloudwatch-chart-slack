describe-rds:
	aws rds describe-db-instances


.e/bin/aws-shell: .e/bin/pip
	.e/bin/pip install aws-shell

.e/bin/pip:
	virtualenv .e
