const getCliArgs = require('./getCliArgs');
const boxify = require('./boxify');
const colorize = require('./colorize');

const stepMap = {
    'checkout-repo': {
        order: 1,
        label: 'Checkout Repository',
        include: true,
    },
    'setup-node': {
        order: 2,
        label: 'Setup Node',
        include: true,
    },
    'variables': {
        order: 3,
        label: 'Extract Variables',
        include: true,
    },
    'configure-aws': {
        order: 4,
        label: 'Configure AWS credentials',
        include: true,
    },
    'start-metrics': {
        order: 5,
        label: 'Updater Start Metrics',
        include: false,
    },
    'cache': {
        order: 6,
        label: 'Cache node_modules',
        include: true,
    },
    'authenticate': {
        order: 7,
        label: 'Authenticate siteId and secretKey',
        include: true,
    },
    'install': {
        order: 8,
        label: 'Install Packages',
        include: true,
    },
    'build': {
        order: 9,
        label: 'Build Bundle',
        include: true,
    },
    'test': {
        order: 10,
        label: 'Run Tests',
        include: true,
    },
    'snapfu-recs-sync': {
        order: 11,
        label: 'Snapfu Recs Sync',
        include: true,
    },
    'lighthouse': {
        order: 12,
        label: 'Lighthouse Tests',
        include: true,
    },
    'tag': {
        order: 13,
        label: 'Git Tag',
        include: false,
    },
    'pr-comment': {
        order: 14,
        label: 'PR Comment',
        include: true,
    },
    'lighthouse-metrics': {
        order: 15,
        label: 'Lighthouse Metrics',
        include: true,
    },
    's3-upload': {
        order: 16,
        label: 'Copy Files to S3',
        include: true,
    },
    'invalidation': {
        order: 17,
        label: 'Invalidate Files',
        include: true,
    },
    'metrics': {
        order: 18,
        label: 'Conclusion Metrics',
        include: true,
    },
}

const conclusions = {
    success: '✅',
    failure: '❌',
    skipped: '➖',
}

const args = getCliArgs(['steps']);
const steps = enrichSteps(JSON.parse(args.steps));
const maxStepNameLength = steps.reduce((max, step) => step.label.length > max ? step.label.length : max, 0);

const actionFailed = steps.filter((step) => {
    return step.conclusion === 'failure';
}).length > 0;

console.log(colorize[actionFailed ? 'red' : 'green'](boxify(`Snap Action ${ actionFailed ? 'Failed' : 'Completed' }`)));

steps.forEach((step, index) => {
    const conclusion = conclusions[step.conclusion];

    if (index === 0) {
        console.log(`┌────┬${'─'.repeat(maxStepNameLength + 2)}┐`);
    }

    console.log(`│ ${conclusion} │ ${step.label} ${' '.repeat(maxStepNameLength - step.label.length)}│`);

    if (index !== steps.length - 1) {
        console.log(`├────┼${'─'.repeat(maxStepNameLength + 2)}┤`);
    } else {
        console.log(`└────┴${'─'.repeat(maxStepNameLength + 2)}┘`);
    }
});

function enrichSteps(stepData) {
    const steps = [];
    Object.keys(stepData).forEach(stepId => {
        const step = stepData[stepId];
        const stepDetails = stepMap[stepId];
        if (stepDetails) {
            step.id = stepId;
            step.order = stepDetails.order;
            step.label = stepDetails.label;
            if (stepDetails.include) steps.push(step);
        }
    });



    // re-order steps based on step order
    return steps.sort((stepA, stepB) => {
        return stepA.order - stepB.order;
    });
}