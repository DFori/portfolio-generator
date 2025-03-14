import React from 'react';

const Experience = ({ experiences }) => {
  if (!experiences || experiences.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Experience</h2>
        <div className="space-y-8">
          {experiences.map((experience, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <div className="md:flex md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{experience.position}</h3>
                  <p className="text-gray-600">{experience.company}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <p className="text-gray-600">
                    {new Date(experience.startDate).toLocaleDateString()} -{' '}
                    {experience.endDate ? new Date(experience.endDate).toLocaleDateString() : 'Present'}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-gray-600">{experience.description}</p>
                {experience.skills && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {experience.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
