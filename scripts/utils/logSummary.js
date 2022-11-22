const getCliArgs = require('./getCliArgs');
const boxify = require('./boxify');
const colorize = require('./colorize');

const stepMap = {
    'checkout-repo': {
        order: 1,
        label: 'checkout repository',
        include: true,
    },
    'configure-aws': {
        order: 2,
        label: 'configure AWS',
        include: true,
    },
    'variables': {
        order: 3,
        label: 'extract variables',
        include: true,
    },
    'setup-node': {
        order: 4,
        label: 'setup node',
        include: true,
    },
    'cache': {
        order: 5,
        label: 'cache node modules',
        include: true,
    },
    'authenticate': {
        order: 6,
        label: 'authenticate searchspring account',
        include: true,
    },
    'install': {
        order: 7,
        label: 'install node packages',
        include: true,
    },
    'build': {
        order: 8,
        label: 'build snap bundle',
        include: true,
    },
    'test': {
        order: 9,
        label: 'test snap bundle with cypress',
        include: true,
    },
    'snapfu-recs-sync': {
        order: 10,
        label: 'sync snap recommendations',
        include: true,
    },
    'lighthouse': {
        order: 11,
        label: 'test snap bundle with lighthouse',
        include: true,
    },
    'pr-comment': {
        order: 12,
        label: 'comment on pull request',
        include: true,
    },
    'lighthouse-metrics': {
        order: 13,
        label: 'send lighthouse metrics',
        include: true,
    },
    's3-upload': {
        order: 14,
        label: 'upload bundle to CDN',
        include: true,
    },
    'invalidation': {
        order: 15,
        label: 'invalidate resources on CDN',
        include: true,
    },
    'metrics': {
        order: 16,
        label: 'send conclusion metrics',
        include: true,
    },
}

const conclusions = {
    success: '✅',
    failure: '❌',
    skipped: '⛔',
}

const args = getCliArgs(['steps']);
const steps = enrichSteps(JSON.parse(args.steps));
const maxStepNameLength = steps.reduce((max, step) => step.label.length > max ? step.label.length : max, 0);

console.log(colorize.blue(boxify('Snap Action Summary')));

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