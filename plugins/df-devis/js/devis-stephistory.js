class Steps  {
	constructor() {
        this.steps = [];
    }

    add(step_type) {
    	if (step_type instanceof StepType)
    		this.steps.push(step_type);
    	else
    		throw new Error("step_type must the instance of a StepType class");
    }

    get(index) {
    	if (index < 0 || index >= this.steps.length) {
	        throw new Error("Index out of bounds");
	    }
	    return this.steps[index];
    }

    remove_at(index) {
	    if (index < 0 || index >= this.steps.length) {
	        throw new Error("Index out of bounds");
	    }
	    this.steps.splice(index, 1);
	}

	pop() {
		this.remove_at(this.steps.length - 1);
	}

	clear() {
		this.steps = [];
	}

	length() {
		return this.steps.length;
	}
}

class StepType {
	constructor(name, index) {
		this.name = name;
		this.index = index;
	}
}

class StepOptions extends StepType {
	constructor(name, index, option_name, option_id) {
		super(name, index);
		this.option_name = option_name;
		this.option_id = option_id;
	}
}

class StepHistory extends StepType {
	constructor(name, index, display_type) {
		super(name, index);
		this.display_type = display_type;
	}
}

class StepEmail extends StepType {
	constructor(name, index) {
		super(name, index);
	}
}